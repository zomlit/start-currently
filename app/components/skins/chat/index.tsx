import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import IconBrandTwitch from "@icons/outline/brand-twitch.svg?react";
import { motion } from "framer-motion";
import { Message, Badge, Emote } from "@/types/chat";

interface ChatSkinProps {
  messages: Message[];
  textColor: string;
  backgroundColor: string;
  chatBubbleColor: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: string;
  textAlign: "left" | "center" | "right" | "justify";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration: "none" | "underline" | "line-through";
  fontStyle: "normal" | "italic";
  wordSpacing: string;
  textIndent: string;
  padding: string;
  borderColor: string;
  borderWidth: string;
  borderStyle: "none" | "solid" | "dashed" | "dotted";
  borderRadius: string;
  showAvatars: boolean;
  showBadges: boolean;
  showPlatform: boolean;
  textShadowColor: string;
  textShadowHorizontal: number;
  textShadowVertical: number;
  textShadowBlur: number;
  textShadowOpacity: number;
  textShadowAngle: number;
  textShadowDistance: number;
}

const MessageContent: React.FC<{ message: Message; props: ChatSkinProps }> = ({
  message,
  props,
}) => {
  const renderMessageWithEmotes = () => {
    let lastIndex = 0;
    const parts = [];
    const sortedEmotes = Array.isArray(message.emotes)
      ? message.emotes.sort((a, b) => a.positions[0][0] - b.positions[0][0])
      : [];

    sortedEmotes.forEach((emote) => {
      const [start, end] = emote.positions[0];
      if (start > lastIndex) {
        parts.push(message.message.slice(lastIndex, start));
      }
      parts.push(
        <img
          key={`${emote.id}-${start}`}
          src={emote.url}
          alt={emote.name}
          title={emote.name}
          className="inline-block"
          style={{ height: "1.5em", verticalAlign: "middle" }}
        />
      );
      lastIndex = end + 1;
    });

    if (lastIndex < message.message.length) {
      parts.push(message.message.slice(lastIndex));
    }

    return parts.length > 0 ? parts : message.message;
  };

  return (
    <>
      {props.showBadges && message.badges.user.length > 0 && (
        <span className="mr-1">
          {message.badges.user.map((badge) => {
            if (!badge.urls) {
              console.warn(`Badge ${badge.id} is missing urls`);
              return null;
            }
            return (
              <img
                key={`${badge.id}-${badge.version}`}
                src={badge.urls["1x"]}
                srcSet={`${badge.urls["1x"]} 1x, ${badge.urls["2x"]} 2x, ${badge.urls["4x"]} 4x`}
                alt={badge.id}
                title={badge.id}
                className="mr-1 inline-block h-4 w-4"
              />
            );
          })}
        </span>
      )}
      {props.showPlatform && message.platform && (
        <span className="mr-1 inline-block h-4 w-4">
          <IconBrandTwitch className="h-full w-full text-purple-500" />
        </span>
      )}
      <span
        style={{ color: message.color || props.textColor }}
        className="font-bold"
      >
        {message.username}
      </span>
      :{" "}
      <span className="ml-2 whitespace-pre-wrap">
        {renderMessageWithEmotes()}
      </span>
    </>
  );
};

const commonStyles = (props: ChatSkinProps) => {
  const textShadow = `${props.textShadowHorizontal}px ${props.textShadowVertical}px ${props.textShadowBlur}px ${props.textShadowColor}`;

  return {
    color: props.textColor,
    backgroundColor: props.backgroundColor,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    lineHeight: props.lineHeight,
    letterSpacing: props.letterSpacing,
    textAlign: props.textAlign,
    textTransform: props.textTransform,
    textDecoration: props.textDecoration,
    fontStyle: props.fontStyle,
    wordSpacing: props.wordSpacing,
    textIndent: props.textIndent,
    padding: props.padding,
    textShadow,
  };
};

const messageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const DefaultChatSkin: React.FC<ChatSkinProps> = (props) => (
  <ScrollArea className="h-full">
    <motion.div
      className="flex flex-col space-y-4 p-4"
      style={commonStyles(props)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      {props.messages.map((message) => (
        <motion.div
          key={message.id}
          className="flex items-start space-x-2"
          variants={messageVariants}
        >
          {props.showAvatars && (
            <Avatar>
              <AvatarImage src={message.avatar} alt={message.username} />
              <AvatarFallback>{message.username[0]}</AvatarFallback>
            </Avatar>
          )}
          <div
            className="max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2"
            style={{ background: props.chatBubbleColor }}
          >
            <MessageContent message={message} props={props} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  </ScrollArea>
);

export const CompactChatSkin: React.FC<ChatSkinProps> = (props) => (
  <ScrollArea className="h-full">
    <motion.div
      className="flex flex-col space-y-1 p-2"
      style={commonStyles(props)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
    >
      {props.messages.map((message) => (
        <motion.div
          key={message.id}
          className="flex items-baseline space-x-1 text-sm"
          variants={messageVariants}
        >
          {props.showAvatars && (
            <Avatar className="mr-1 h-4 w-4">
              <AvatarImage src={message.avatar} alt={message.username} />
              <AvatarFallback>{message.username[0]}</AvatarFallback>
            </Avatar>
          )}
          <MessageContent message={message} props={props} />
        </motion.div>
      ))}
    </motion.div>
  </ScrollArea>
);

export const BubbleChatSkin: React.FC<ChatSkinProps> = (props) => (
  <ScrollArea className="h-full">
    <motion.div
      className="flex flex-col space-y-2 p-4"
      style={commonStyles(props)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      {props.messages.map((message) => (
        <motion.div
          key={message.id}
          className={cn(
            "flex",
            message.username === "You" ? "justify-end" : "justify-start"
          )}
          variants={messageVariants}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2",
              message.username === "You"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
            style={{ background: props.chatBubbleColor }}
          >
            {props.showAvatars && (
              <Avatar className="mr-2 inline-block h-6 w-6 align-middle">
                <AvatarImage src={message.avatar} alt={message.username} />
                <AvatarFallback>{message.username[0]}</AvatarFallback>
              </Avatar>
            )}
            <MessageContent message={message} props={props} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  </ScrollArea>
);
