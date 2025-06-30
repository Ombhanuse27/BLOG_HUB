import React from "react";

const stickers = [
  "😀", "😍", "🔥", "😂", "👍", "🎉", "😎", "🥳", "💯", "❤️"
];

const StickerPicker = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg shadow-md max-w-xs">
      {stickers.map((sticker, index) => (
        <button
          key={index}
          onClick={() => onSelect(sticker)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          {sticker}
        </button>
      ))}
    </div>
  );
};

export default StickerPicker;
