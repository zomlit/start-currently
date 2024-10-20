import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCog,
  faRandom,
  faTimes,
  faRedoAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import tmi from "tmi.js";
import { Wheel } from "react-custom-roulette";
import GenericHeader from "./GenericHeader";
import { Container } from "@/components/layout/Container";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";

interface WheelData {
  option: string;
}

interface PresetData {
  [key: string]: string[];
}

const presets: PresetData = {
  Custom: [],
  "Twitch Chat": [],
  "Bean Boozled (5th Edition)": [
    "Stinky Socks or Tutti-Fruitti",
    "Lawn Clippings or Lime",
    "Rotten Egg or Buttered Popcorn",
    "Toothpaste or Berry Blue",
    "Barf or Peach",
    "Canned Dog Food or Chocolate Pudding",
    "Spoiled Milk or Coconut",
    "Dead Fish or Strawberry Banana Smoothie",
    "Booger or Juicy Pear",
    "Dirty Dishwater or Birthday Cake",
  ],
  "Bean Boozled (6th Edition)": [
    "Rotten Egg or Buttered Popcorn",
    "Toothpaste or Berry Blue",
    "Barf or Peach",
    "Stinky Socks or Tutti-Fruitti",
    "Booger or Juicy Pear",
    "Old Bandage or Coconut",
    "Liver and Onions or Cappuccino",
    "Skunk Spray or Licorice",
    "Spoiled Milk or Birthday Cake",
    "Dead Fish or Strawberry Banana Smoothie",
  ],
  "Bean Boozled Fiery Five": [
    "Sriracha or Strawberry Margarita",
    "Jalapeño or Green Apple",
    "Cayenne or Watermelon",
    "Habanero or Pineapple",
    "Carolina Reaper or Strawberry",
  ],
};

const WheelSpin: React.FC = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [data, setData] = useState<WheelData[]>([{ option: "Add items" }]);
  const [selectedPreset, setSelectedPreset] = useState<string>(
    "Bean Boozled (5th Edition)"
  );
  const [customItems, setCustomItems] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [customPreset, setCustomPreset] = useState<string[]>([]);
  const [removeOnPick, setRemoveOnPick] = useState<boolean>(false);
  const [showPreviousPicks, setShowPreviousPicks] = useState<boolean>(false);
  const [previousPicks, setPreviousPicks] = useState<string[]>([]);
  const [twitchChannel, setTwitchChannel] = useState<string>("");
  const [triggerWord, setTriggerWord] = useState<string>("");
  const [isTwitchListening, setIsTwitchListening] = useState<boolean>(false);
  const clientRef = useRef<tmi.Client | null>(null);
  const [isTwitchPreset, setIsTwitchPreset] = useState<boolean>(false);

  const truncateText = (text: string, maxLength: number = 20): string => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== "Custom" && value !== "Twitch Chat") {
      setCustomItems("");
    }
    if (value === "Twitch Chat") {
      setData([{ option: "Start Twitch listener" }]);
      setIsTwitchListening(false);
    } else {
      setData(presets[value].map((item) => ({ option: truncateText(item) })));
    }
  };

  const handleCustomItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomItems(e.target.value);
  };

  const handleCustomItemsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const items = customItems
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    if (items.length > 0) {
      setCustomPreset(items);
      setData(items.map((item) => ({ option: truncateText(item) })));
      setSelectedPreset("Custom");
    }
  };

  const handleSpinClick = () => {
    if (!mustSpin && data.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (removeOnPick) {
      const newData = [...data];
      newData.splice(prizeNumber, 1);
      setData(newData);
    }
    setPreviousPicks([...previousPicks, result]);
  };

  const handleReroll = () => {
    setShowModal(false);
    handleSpinClick();
  };

  const handleRemovePreviousPick = (index: number) => {
    const newPreviousPicks = [...previousPicks];
    newPreviousPicks.splice(index, 1);
    setPreviousPicks(newPreviousPicks);
  };

  const handleTwitchChannelChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTwitchChannel(e.target.value);
  };

  const handleTriggerWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTriggerWord(e.target.value);
  };

  const startTwitchListener = () => {
    if (!twitchChannel || !triggerWord) return;

    clientRef.current = new tmi.Client({
      channels: [twitchChannel],
    });

    clientRef.current
      .connect()
      .then(() => {
        setIsTwitchListening(true);
        setData([{ option: "Waiting for messages..." }]);
        clientRef.current?.on("message", (channel, tags, message, self) => {
          if (self) return;
          if (message.toLowerCase().includes(triggerWord.toLowerCase())) {
            setData((prevData) => {
              const newData = prevData.filter(
                (item) => item.option !== "Waiting for messages..."
              );
              if (!newData.some((item) => item.option === tags.username)) {
                newData.push({ option: tags.username });
              }
              return newData.length > 0
                ? newData
                : [{ option: "Waiting for messages..." }];
            });
          }
        });
      })
      .catch(console.error);
  };

  const stopTwitchListener = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      setIsTwitchListening(false);
      setData((prevData) =>
        prevData.filter((item) => item.option !== "Waiting for messages...")
      );
    }
  };

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedPreset === "Twitch Chat") {
      setIsTwitchPreset(true);
      setData([{ option: "Start Twitch listener" }]);
    } else {
      setIsTwitchPreset(false);
      if (selectedPreset === "Custom") {
        setData(
          customPreset.length > 0
            ? customPreset.map((item) => ({ option: truncateText(item) }))
            : [{ option: "Add custom items" }]
        );
      } else {
        setData(
          presets[selectedPreset].map((item) => ({
            option: truncateText(item),
          }))
        );
      }
    }
  }, [selectedPreset, customPreset]);

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  return (
    <>
      <Container maxWidth="7xl" isDashboard>
        <GenericHeader
          category="Widgets"
          title="Wheel of Fortune"
          className="font-black"
          description=""
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen text-gray-800 dark:text-gray-200 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-white/10 p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Game Settings
              </h2>
              <div className="mb-4">
                <Select
                  onValueChange={handlePresetChange}
                  value={selectedPreset}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(presets).map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        {preset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPreset === "Custom" && (
                <form onSubmit={handleCustomItemsSubmit} className="mb-4">
                  <label
                    htmlFor="customItems"
                    className="block mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Custom Items:
                  </label>
                  <input
                    type="text"
                    id="customItems"
                    value={customItems}
                    onChange={handleCustomItemsChange}
                    className="w-full p-2 rounded mb-2 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none"
                    placeholder="Item1, Item2, Item3..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300 flex items-center justify-center w-full"
                  >
                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                    Set Custom Items
                  </button>
                </form>
              )}

              {selectedPreset === "Twitch Chat" && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Twitch Chat Listener
                  </h3>
                  <input
                    type="text"
                    value={twitchChannel}
                    onChange={handleTwitchChannelChange}
                    placeholder="Twitch Channel Name"
                    className="w-full p-2 rounded mb-2 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={triggerWord}
                    onChange={handleTriggerWordChange}
                    placeholder="Trigger Word"
                    className="w-full p-2 rounded mb-2 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none"
                  />
                  {!isTwitchListening ? (
                    <button
                      onClick={startTwitchListener}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition duration-300 w-full"
                    >
                      Start Listening
                    </button>
                  ) : (
                    <button
                      onClick={stopTwitchListener}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-300 w-full"
                    >
                      Stop Listening
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remove-on-pick"
                    checked={removeOnPick}
                    onCheckedChange={setRemoveOnPick}
                  />
                  <Label htmlFor="remove-on-pick">
                    Remove item after it's picked
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-previous-picks"
                    checked={showPreviousPicks}
                    onCheckedChange={setShowPreviousPicks}
                  />
                  <Label htmlFor="show-previous-picks">
                    Show previous picks
                  </Label>
                </div>
              </div>
              {showPreviousPicks && previousPicks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 bg-white dark:bg-white/10 p-6 rounded-lg shadow-lg"
                >
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Previous Picks
                  </h2>
                  <ul>
                    {previousPicks.map((pick, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center mb-2 text-gray-700 dark:text-gray-300"
                      >
                        <span>{pick}</span>
                        <button
                          onClick={() => handleRemovePreviousPick(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="mb-8 w-full max-w-md relative">
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={data.length > 0 ? data : [{ option: "Add items" }]}
                  onStopSpinning={() => {
                    setMustSpin(false);
                    let fullText: string;
                    if (selectedPreset === "Custom") {
                      fullText =
                        customPreset[prizeNumber] || "No item selected";
                    } else if (selectedPreset === "Twitch Chat") {
                      fullText =
                        data[prizeNumber]?.option || "No user selected";
                    } else {
                      fullText =
                        presets[selectedPreset]?.[prizeNumber] ||
                        "No item selected";
                    }
                    setResult(fullText);
                    setShowModal(true);
                    triggerConfetti();
                  }}
                  backgroundColors={[
                    "#3B82F6",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#EC4899",
                    "#6366F1",
                    "#14B8A6",
                  ]}
                  textColors={["#ffffff"]}
                  outerBorderColor="#4B5563"
                  outerBorderWidth={5}
                  innerRadius={20}
                  innerBorderColor="#4B5563"
                  innerBorderWidth={20}
                  radiusLineColor="#4B5563"
                  radiusLineWidth={1}
                  fontSize={12}
                  textDistance={60}
                  perpendicularText={false}
                  pointerProps={
                    {
                      style: {
                        transform: "scale(0.5)",
                        transformOrigin: "left bottom",
                      },
                    } as any
                  }
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-full text-xl font-bold shadow-lg transition duration-300 flex items-center justify-center ${
                  data.length === 0
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                onClick={handleSpinClick}
                disabled={mustSpin || data.length === 0}
              >
                <FontAwesomeIcon icon={faRandom} className="mr-2" />
                {mustSpin
                  ? "Spinning..."
                  : data.length === 0
                    ? "No items"
                    : "SPIN"}
              </motion.button>
            </motion.div>
          </div>

          <AlertDialog open={showModal} onOpenChange={setShowModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Result</AlertDialogTitle>
                <AlertDialogDescription>
                  <p className="text-4xl font-extrabold text-yellow-500 dark:text-yellow-400 mb-6">
                    {result}
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleModalClose}>
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  OK
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleReroll}>
                  <FontAwesomeIcon icon={faRedoAlt} className="mr-2" />
                  Re-roll
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </Container>
    </>
  );
};

export default WheelSpin;
