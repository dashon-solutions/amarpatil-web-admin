import React from "react";

/**
 * Format section/hero headings in an elegant, luxury editorial style.
 * - Parses markdown-style asterisks (*word*) to render custom italic segments.
 * - Otherwise, automatically renders the first word (or first two words for titles > 3 words)
 *   in a lightweight, thin italic font weight, and the remaining words in a bold font weight.
 */
export function formatHeading(title: string | undefined): React.ReactNode {
  if (!title) return "";

  // 1. Check if the admin/user explicitly specified italics using asterisks
  if (title.includes("*")) {
    const parts = title.split("*");
    return (
      <>
        {parts.map((part, index) => {
          // Odd indices are inside asterisks
          if (index % 2 === 1) {
            return (
              <span key={index} className="italic font-light">
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  }

  // 2. Fallback to automated split formatting
  const words = title.split(" ");
  if (words.length <= 1) {
    return title;
  }

  // If title has more than 3 words, italicize the first 2 words; otherwise, italicize the first 1 word.
  const italicCount = words.length > 3 ? 2 : 1;
  const italicPart = words.slice(0, italicCount).join(" ");
  const regularPart = words.slice(italicCount).join(" ");

  return (
    <div className="font-normal">
      <span className="italic font-light">{italicPart}</span> {regularPart}
    </div>
  );
}
