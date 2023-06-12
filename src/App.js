import React, { useState, useRef } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertToRaw,
} from "draft-js";
import draftToHtml from "draftjs-to-html";

import "draft-js/dist/Draft.css";
import "./App.css";

function App() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const editorRef = useRef(null);

  const focus = () => {
    editorRef.current.focus();
  };

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleBlockStyle = (style) => {
    setEditorState(RichUtils.toggleBlockType(editorState, style));
  };

  const toggleColor = (toggledColor) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    // Remove all active colors
    const nextContentState = Object.keys(colorStyleMap).reduce(
      (updatedContentState, color) => {
        return Modifier.removeInlineStyle(
          updatedContentState,
          selection,
          color
        );
      },
      contentState
    );

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      "change-inline-style"
    );

    const currentStyle = editorState.getCurrentInlineStyle();

    // Unset style override for current color
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, color);
      }, nextEditorState);
    }

    // Apply the toggled color
    if (!currentStyle.has(toggledColor)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledColor
      );
    }

    handleEditorChange(nextEditorState);
  };

  const ColorControls = () => {
    const currentStyle = editorState.getCurrentInlineStyle();

    return (
      <div className="controls">
        {COLORS.map((type) => (
          <StyleButton
            key={type.style}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={toggleColor}
            style={type.style}
          />
        ))}
      </div>
    );
  };

  const StyleButton = ({ active, label, onToggle, style }) => {
    const onButtonClick = (e) => {
      e.preventDefault();
      onToggle(style);
    };

    let buttonStyle = styles.styleButton;
    if (active) {
      buttonStyle = { ...buttonStyle, ...colorStyleMap[style] };
    }

    return (
      <span style={buttonStyle} onMouseDown={onButtonClick}>
        {label}
      </span>
    );
  };

  return (
    <div className="App">
      <div className="EditorSection">
        <div className="Toolbar">
          <button onClick={() => handleInlineStyle("BOLD")}>
            <b>B</b>
          </button>
          <button onClick={() => handleInlineStyle("ITALIC")}>
            <i>I</i>
          </button>
          <button onClick={() => handleInlineStyle("UNDERLINE")}>
            <u>U</u>
          </button>
          <button onClick={() => handleInlineStyle("STRIKETHROUGH")}>
            <s>S</s>
          </button>
          <button onClick={() => handleInlineStyle("CODE")}>
            <code>{`{}`}</code>
          </button>
          <button onClick={() => handleBlockStyle("header-one")}>
            <b>H1</b>
          </button>
          <button onClick={() => handleBlockStyle("header-two")}>
            <b>H2</b>
          </button>
          <button onClick={() => handleBlockStyle("unordered-list-item")}>
            &bull;
          </button>
          <button onClick={() => handleBlockStyle("ordered-list-item")}>
            1.
          </button>
        </div>
        <div className="EditorContainer">
          <ColorControls />
          <div className="" onClick={focus}>
            <Editor
              customStyleMap={colorStyleMap}
              editorState={editorState}
              onChange={handleEditorChange}
              placeholder="Write something colorful..."
              ref={editorRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function draftjsToHtml(editorState) {
  const contentState = editorState.getCurrentContent();
  const rawContentState = convertToRaw(contentState);
  const html = draftToHtml(rawContentState);
  return html;
}

function convertToHtmlString(contentState) {
  const html = convertToHtml(contentState);
  const encodedHtml = encodeHtmlEntities(html);
  return encodedHtml;
}

function convertToHtml(contentState) {
  const contentStateWithEntity = convertMentionsToEntities(contentState);
  const contentHtml = stateToHTML(contentStateWithEntity);
  return contentHtml;
}

function convertMentionsToEntities(contentState) {
  // Handle mentions conversion to entities if needed
  return contentState;
}

function stateToHTML(contentState) {
  // Implement the conversion from Draft.js content state to HTML if needed
  return ""; // Return an empty string for now
}

function encodeHtmlEntities(html) {
  // Implement HTML entity encoding if needed
  return html; // Return the original HTML string for now
}

const COLORS = [
  { label: "Red", style: "red" },
  { label: "Orange", style: "orange" },
  { label: "Yellow", style: "yellow" },
  { label: "Green", style: "green" },
  { label: "Blue", style: "blue" },
  { label: "Indigo", style: "indigo" },
  { label: "Violet", style: "violet" },
];

const colorStyleMap = {
  red: {
    color: "rgba(255, 0, 0, 1.0)",
  },
  orange: {
    color: "rgba(255, 127, 0, 1.0)",
  },
  yellow: {
    color: "rgba(225, 225, 0, 1.0)",
  },
  green: {
    color: "rgba(0, 180, 0, 1.0)",
  },
  blue: {
    color: "rgba(0, 0, 255, 1.0)",
  },
  indigo: {
    color: "rgba(75, 0, 130, 1.0)",
  },
  violet: {
    color: "rgba(127, 0, 255, 1.0)",
  },
};

const styles = {
  styleButton: {
    color: "#999",
    cursor: "pointer",
    marginRight: 16,
    padding: "2px 0",
  },
};

export default App;
