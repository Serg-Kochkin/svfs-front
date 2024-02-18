import React from "react";

const FileRow = ({ file, onFileSelect }) => (
  <tr onClick={() => onFileSelect(file)} role="button">
    <td>
      {file.type === "FOLDER" ? "📁 " : "📄 "}
      {file.name}
    </td>
    <td>
      <small>
        {new Date(file.created_at)
          .toISOString()
          .replace("T", " ")
          .substring(0, 19)}
      </small>
    </td>
    <td>
      <small>
        {new Date(file.modified_at)
          .toISOString()
          .replace("T", " ")
          .substring(0, 19)}
      </small>
    </td>
    <td>
      <small>{file.type === "FILE" && `${file.size} bytes`}</small>
    </td>
  </tr>
);

export default FileRow;
