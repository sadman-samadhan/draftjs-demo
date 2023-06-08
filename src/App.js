import React, { useState } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import 'draft-js/dist/Draft.css';
import './App.css';

function App() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleBlockStyle = (style) => {
    setEditorState(RichUtils.toggleBlockType(editorState, style));
  };

  return (
    <div className="App"> 
      <div className="Toolbar">
        <button onClick={() => handleInlineStyle('BOLD')}><b>B</b></button>
        <button onClick={() => handleInlineStyle('ITALIC')}><i>I</i></button>
        <button onClick={() => handleInlineStyle('UNDERLINE')}><u>U</u></button>
        <button onClick={() => handleInlineStyle('STRIKETHROUGH')}><s>S</s></button>
        <button onClick={() => handleInlineStyle('CODE')}><code>{`{}`}</code></button>
        <button onClick={() => handleBlockStyle('header-one')}>H1</button>
        <button onClick={() => handleBlockStyle('header-two')}>H2</button>
        <button onClick={() => handleBlockStyle('unordered-list-item')}>&bull;</button>
        <button onClick={() => handleBlockStyle('ordered-list-item')}>1.</button>
      </div>
      <div className="EditorContainer">
        <Editor editorState={editorState} onChange={handleEditorChange} />
      </div>
      <div className="Content">
        <h2>Content Preview:</h2>
        <div dangerouslySetInnerHTML={{ __html: draftjsToHtml(editorState) }} />
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
  return ''; // Return an empty string for now
}

function encodeHtmlEntities(html) {
  // Implement HTML entity encoding if needed
  return html; // Return the original HTML string for now
}

export default App;
