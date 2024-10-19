import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCog, faRandom, faTimes, faRedoAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import tmi from 'tmi.js';
import { Wheel } from 'react-custom-roulette';

interface PresetData {
  [key: string]: string[];
}

interface WheelData {
  option: string;
}

const presets: PresetData = {
  'Custom': [],
  'Twitch Chat': [],
  'Bean Boozled (5th Edition)': [
    'Stinky Socks or Tutti-Fruitti',
    'Lawn Clippings or Lime',
    'Rotten Egg or Buttered Popcorn',
    'Toothpaste or Berry Blue',
    'Barf or Peach',
    'Canned Dog Food or Chocolate Pudding',
    'Spoiled Milk or Coconut',
    'Dead Fish or Strawberry Banana Smoothie',
    'Booger or Juicy Pear',
    'Dirty Dishwater or Birthday Cake'
  ],
  'Bean Boozled (6th Edition)': [
    'Rotten Egg or Buttered Popcorn',
    'Toothpaste or Berry Blue',
    'Barf or Peach',
    'Stinky Socks or Tutti-Fruitti',
    'Booger or Juicy Pear',
    'Old Bandage or Coconut',
    'Liver and Onions or Cappuccino',
    'Skunk Spray or Licorice',
    'Spoiled Milk or Birthday Cake',
    'Dead Fish or Strawberry Banana Smoothie'
  ],
  'Bean Boozled Fiery Five': [
    'Sriracha or Strawberry Margarita',
    'Jalapeño or Green Apple',
    'Cayenne or Watermelon',
    'Habanero or Pineapple',
    'Carolina Reaper or Strawberry'
  ],
};

const Wheelspin: React.FC = () => {
  const [mustSpin, setMustSpin] = useState<boolean>(false);
  const [prizeNumber, setPrizeNumber] = useState<number>(0);
  const [data, setData] = useState<WheelData[]>([{ option: 'Add items' }]);
  const [selectedPreset, setSelectedPreset] = useState<string>('Bean Boozled (5th Edition)');
  const [customItems, setCustomItems] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [customPreset, setCustomPreset] = useState<string[]>([]);
  const [removeOnPick, setRemoveOnPick] = useState<boolean>(false);
  const [showPreviousPicks, setShowPreviousPicks] = useState<boolean>(false);
  const [previousPicks, setPreviousPicks] = useState<string[]>([]);
  const [twitchChannel, setTwitchChannel] = useState<string>('');
  const [triggerWord, setTriggerWord] = useState<string>('');
  const [isTwitchListening, setIsTwitchListening] = useState<boolean>(false);
  const clientRef = useRef<tmi.Client | null>(null);
  const [isTwitchPreset, setIsTwitchPreset] = useState<boolean>(false);

  const truncateText = (text: string, maxLength: number = 20): string => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    if (selectedPreset === 'Twitch Chat') {
      setIsTwitchPreset(true);
      setData([{ option: 'Start Twitch listener' }]);
    } else {
      setIsTwitchPreset(false);
      if (selectedPreset === 'Custom') {
        setData(customPreset.length > 0
          ? customPreset.map(item => ({ option: truncateText(item) }))
          : [{ option: 'Add custom items' }]
        );
      } else {
        setData(presets[selectedPreset].map(item => ({ option: truncateText(item) })));
      }
    }
  }, [selectedPreset, customPreset]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRemoveOnPickChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemoveOnPick(e.target.checked);
  };

  const handleShowPreviousPicksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowPreviousPicks(e.target.checked);
  };

  const handleSpinClick = () => {
    if (!mustSpin && data.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setResult('');
      setShowConfetti(false);

      if (isTwitchListening) {
        stopTwitchListener();
      }
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPreset(e.target.value);
    if (e.target.value !== 'Custom' && e.target.value !== 'Twitch Chat') {
      setCustomItems('');
    }
    if (e.target.value === 'Twitch Chat') {
      setData([{ option: 'Start Twitch listener' }]);
      setIsTwitchListening(false);
    }
  };

  const handleCustomItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomItems(e.target.value);
  };

  const handleCustomItemsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const items = customItems.split(',').map(item => item.trim()).filter(item => item !== '');
    if (items.length > 0) {
      setCustomPreset(items);
      setData(items.map(item => ({ option: truncateText(item) })));
      setSelectedPreset('Custom');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowConfetti(false);
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

  const handleTwitchChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwitchChannel(e.target.value);
  };

  const handleTriggerWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTriggerWord(e.target.value);
  };

  const startTwitchListener = () => {
    if (!twitchChannel || !triggerWord) return;

    clientRef.current = new tmi.Client({
      channels: [twitchChannel]
    });

    clientRef.current.connect().then(() => {
      setIsTwitchListening(true);
      setData([{ option: 'Waiting for messages...' }]);
      clientRef.current?.on('message', (channel, tags, message, self) => {
        if (self) return;
        if (message.toLowerCase().includes(triggerWord.toLowerCase())) {
          setData(prevData => {
            const newData = prevData.filter(item => item.option !== 'Waiting for messages...');
            if (!newData.some(item => item.option === tags.username)) {
              newData.push({ option: tags.username });
            }
            return newData.length > 0 ? newData : [{ option: 'Waiting for messages...' }];
          });
        }
      });
    }).catch(console.error);
  };

  const stopTwitchListener = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      setIsTwitchListening(false);
      setData(prevData => prevData.filter(item => item.option !== 'Waiting for messages...'));
    }
  };

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen text-gray-300 overflow-hidden"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-8 text-center text-gray-100"
        >
          Wheel of Fortune
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Game Settings</h2>
            <div className="mb-4">
              <label htmlFor="preset" className="block mb-2">Select Preset:</label>
              <select
                id="preset"
                value={selectedPreset}
                onChange={handlePresetChange}
                className="w-full p-2 border rounded bg-zinc-700 text-gray-100 border-zinc-600"
              >
                {Object.keys(presets).map(preset => (
                  <option key={preset} value={preset}>{preset}</option>
                ))}
              </select>
            </div>

            {selectedPreset === 'Custom' && (
              <form onSubmit={handleCustomItemsSubmit} className="mb-4">
                <label htmlFor="customItems" className="block mb-2">Custom Items:</label>
                <input
                  type="text"
                  id="customItems"
                  value={customItems}
                  onChange={handleCustomItemsChange}
                  className="w-full p-2 border rounded mb-2 bg-zinc-700 text-gray-100 border-zinc-600"
                  placeholder="Item1, Item2, Item3..."
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300 flex items-center justify-center w-full">
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Set Custom Items
                </button>
              </form>
            )}

            {selectedPreset === 'Twitch Chat' && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Twitch Chat Listener</h3>
                <input
                  type="text"
                  value={twitchChannel}
                  onChange={handleTwitchChannelChange}
                  placeholder="Twitch Channel Name"
                  className="w-full p-2 border rounded mb-2 bg-zinc-700 text-gray-100 border-zinc-600"
                />
                <input
                  type="text"
                  value={triggerWord}
                  onChange={handleTriggerWordChange}
                  placeholder="Trigger Word"
                  className="w-full p-2 border rounded mb-2 bg-zinc-700 text-gray-100 border-zinc-600"
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

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={removeOnPick}
                  onChange={handleRemoveOnPickChange}
                  className="mr-2"
                />
                Remove item after it's picked
              </label>
            </div>
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPreviousPicks}
                  onChange={handleShowPreviousPicksChange}
                  className="mr-2"
                />
                Show previous picks
              </label>
            </div>
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
                data={data.length > 0 ? data : [{ option: 'Add items' }]}
                onStopSpinning={() => {
                  setMustSpin(false);
                  let fullText: string;
                  if (selectedPreset === 'Custom') {
                    fullText = customPreset[prizeNumber] || 'No item selected';
                  } else if (selectedPreset === 'Twitch Chat') {
                    fullText = data[prizeNumber]?.option || 'No user selected';
                  } else {
                    fullText = presets[selectedPreset]?.[prizeNumber] || 'No item selected';
                  }
                  setResult(fullText);
                  setShowModal(true);
                  setShowConfetti(true);
                }}
                backgroundColors={[
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
                ]}
                textColors={['#ffffff']}
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
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 rounded-full text-xl font-bold shadow-lg transition duration-300 flex items-center justify-center ${
                data.length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              onClick={handleSpinClick}
              disabled={mustSpin || data.length === 0}
            >
              <FontAwesomeIcon icon={faRandom} className="mr-2" />
              {mustSpin ? 'Spinning...' : data.length === 0 ? 'No items' : 'SPIN'}
            </motion.button>
          </motion.div>
        </div>

        {showPreviousPicks && previousPicks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-zinc-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Previous Picks</h2>
            <ul>
              {previousPicks.map((pick, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                  <span>{pick}</span>
                  <button
                    onClick={() => handleRemovePreviousPick(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              {showConfetti && (
                <ReactConfetti
                  width={windowSize.width}
                  height={windowSize.height}
                  recycle={false}
                  numberOfPieces={200}
                  gravity={0.1}
                />
              )}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-zinc-800 p-6 rounded-lg shadow-lg max-w-sm w-full"
              >
                <h2 className="text-3xl font-bold mb-4 text-gray-100">Result</h2>
                <p className="text-4xl font-extrabold text-yellow-400 mb-6">{result}</p>
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleModalClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    OK
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReroll}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300"
                  >
                    <FontAwesomeIcon icon={faRedoAlt} className="mr-2" />
                    Re-roll
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Wheelspin;
