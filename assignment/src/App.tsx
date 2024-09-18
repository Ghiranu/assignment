import "./App.css";
import { useRef, useState, useEffect } from "react";

interface CursorPosition {
  startOffset: number;
  endOffset: number;
  range: Range;
}

function App() {
  const suggestedTags = ["React", "Next.js", "Tailwind", "JavaScript", "CSS"];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<CursorPosition | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (divRef.current) {
        const tags = Array.from(
          divRef.current.querySelectorAll("span[data-tag-id]")
        );
        const currentTags = tags.map(
          (tag) => tag.textContent?.trim().replace("×", "") ?? ""
        );
        setSelectedTags(currentTags);
      }
    });

    if (divRef.current) {
      observer.observe(divRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setCursorPos({
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        range: range.cloneRange(),
      });
    }
  };

  const insertTagAtCursor = (tag: string) => {
    const selection = window.getSelection();

    const isTagAlreadyAdded = selectedTags.includes(tag);

    const shouldInsertTagAtCursorPosition =
      selection && cursorPos && divRef.current && !isTagAlreadyAdded;

    if (shouldInsertTagAtCursorPosition) {
      const tagId = `tag-${Date.now()}`;

      const tagElement = document.createElement("span");
      tagElement.textContent = `${tag}`;
      tagElement.setAttribute("class", "tag");
      tagElement.setAttribute("data-tag-id", tagId);
      tagElement.contentEditable = "false";

      const removeButton = document.createElement("span");
      removeButton.textContent = "×";
      removeButton.setAttribute("class", "remove-tag-icon");
      removeButton.onclick = () => removeTag(tagId);

      tagElement.appendChild(removeButton);

      const range = cursorPos.range;
      range.deleteContents();
      range.insertNode(tagElement);

      range.setStartAfter(tagElement);
      selection.removeAllRanges();
      selection.addRange(range);

      saveCursorPosition();

      if (!selectedTags.includes(tag)) {
        setSelectedTags((prevTags) => [...prevTags, tag]);
      }
    }
  };

  const removeTag = (tagId: string) => {
    if (divRef.current) {
      const tagElement = divRef.current.querySelector(
        `[data-tag-id="${tagId}"]`
      );
      if (tagElement) {
        tagElement.remove();
      }
    }
  };

  return (
    <div className="tag-input-container">
      <div
        contentEditable
        className="input-container"
        ref={divRef}
        onMouseUp={saveCursorPosition}
        onKeyUp={saveCursorPosition}
        onInput={saveCursorPosition}
      ></div>
      <div className="tags-container">
        {suggestedTags.map((tag) => (
          <button
            className="button-contained"
            key={tag}
            onClick={() => insertTagAtCursor(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
