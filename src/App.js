import React, { useState, useRef } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import createImagePlugin from '@draft-js-plugins/image';
import createDragNDropUploadPlugin from '@draft-js-plugins/drag-n-drop';
import readFile from '@draft-js-plugins/drag-n-drop';
import "draft-js/dist/Draft.css"; 
import "./App.css";

function App() {
  const imagePlugin = createImagePlugin();

  const initialState = {
    entityMap: {
      0: {
        type: "IMAGE",
        mutability: "IMMUTABLE",
        data: {
          src: "https://dummyimage.com/600x400/000/fff",
        },
      },
    },
    blocks: [
      {
        key: "9gm3s",
        text: "You can have images in your text field. This is a very rudimentary example, but you can enhance the image plugin with resizing, focus or alignment plugins.",
        type: "bold",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "ov7r",
        text: " ",
        type: "atomic",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [
          {
            offset: 0,
            length: 1,
            key: 0,
          },
        ],
        data: {},
      },
      {
        key: "e23a8",
        text: "See advanced examples further down …",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
  };

  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(convertFromRaw(initialState))
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

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      return;
    }

    const file = imageFiles[0];
    console.log(imageFiles);

    const reader = new FileReader();

    reader.onload = () => {
      const url = reader.result;
      console.log(url);
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "IMAGE",
        "IMMUTABLE",
        { src: url }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(editorState, {
        currentContent: contentStateWithEntity,
      });
      const newContentState = Modifier.insertText(
        newEditorState.getCurrentContent(),
        newEditorState.getSelection(),
        " ",
        null,
        entityKey
      );

      const newEditorStateWithImage = EditorState.push(
        newEditorState,
        newContentState,
        "insert-characters"
      );

      setEditorState(newEditorStateWithImage);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  
  // function mockUpload(data, success, failed, progress) {
  //   function doProgress(percent) {
  //     progress(percent || 1);
  //     if (percent === 100) {
  //       // Start reading the file
  //       Promise.all(data.files.map(readFile)).then((files) =>
  //         success(files, { retainSrc: true })
  //       );
  //     } else {
  //       setTimeout(doProgress, 250, (percent || 0) + 10);
  //     }
  //   }
  
  //   doProgress();
  // }

  // const dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
  //   handleUpload: mockUpload,
  //   addImage: imagePlugin.addImage,
  // });

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
        <div
          className="EditorContainer"
          onClick={focus}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ColorControls />
          <div className="" ref={editorRef}>
            <Editor
              customStyleMap={colorStyleMap}
              plugins={[imagePlugin]} 
              editorState={editorState}
              onChange={handleEditorChange}
              placeholder="Write something"
            />
          </div>
        </div>
      </div>
    </div>
  );
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
