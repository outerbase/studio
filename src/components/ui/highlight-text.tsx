"use client";
interface Props {
  text: string;
  highlight?: string;
}
export default function HighlightText({ text, highlight }: Props) {
  if (!highlight) return <span>{text}</span>;

  const regex = new RegExp(
    "(" + (highlight ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
    "i"
  );

  const splitedText = text.split(regex);

  return (
    <span>
      {splitedText.map((text, idx) => {
        return text.toLowerCase() === (highlight ?? "").toLowerCase() ? (
          <span key={idx} className="bg-yellow-300 text-black">
            {text}
          </span>
        ) : (
          <span key={idx}>{text}</span>
        );
      })}
    </span>
  );
}
