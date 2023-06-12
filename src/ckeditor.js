import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const RichTextEditor = () => {
  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    console.log(data);
  };

  return (
    <div>
      <CKEditor
        editor={ClassicEditor}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default RichTextEditor;