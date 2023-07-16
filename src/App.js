import React, { useState, useRef } from "react";
import { Editor, EditorState, RichUtils, Modifier, convertFromRaw, AtomicBlockUtils } from "draft-js";
import createImagePlugin from "@draft-js-plugins/image";
import createDragNDropUploadPlugin from "@draft-js-plugins/drag-n-drop";
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
        text: "Hello",
        type: "unstyled",
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
        text: "Write here",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
  };

  const handleAddImage = (url) => {
    const newEditorState = imagePlugin.addImage(editorState, url);
    setEditorState(newEditorState);
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

  const handleDrop = (selection, dataTransfer) => {
    const files = Array.from(dataTransfer.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const contentStateWithEntity = editorState
          .getCurrentContent()
          .createEntity("IMAGE", "IMMUTABLE", { src: dataUrl });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

        const newEditorState = AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          " "
        );

        setEditorState(newEditorState);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const blockRendererFn = (contentBlock) => {
    const type = contentBlock.getType();

    if (type === "atomic") {
      return {
        component: AtomicBlock,
        editable: false,
      };
    }

    return null;
  };

  const AtomicBlock = (props) => {
    const { block, contentState } = props;
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src } = entity.getData();
    return <img src={src} alt="Atomic Block" />;
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
        <div
          className="EditorContainer"
          onClick={focus}
          onDrop={(e) => {
            e.preventDefault();
            const selection = editorState.getSelection();
            const dataTransfer = e.dataTransfer;
            handleDrop(selection, dataTransfer);
          }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "1px dashed #ccc",
            padding: "1rem",
            minHeight: "200px",
          }}
        >
          <ColorControls />
          <div className="" ref={editorRef}>
            <Editor
              editorState={editorState}
              onChange={handleEditorChange}
              blockRendererFn={blockRendererFn}
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
