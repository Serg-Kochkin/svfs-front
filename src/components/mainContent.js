import Container from "react-bootstrap/Container";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FileRow from "./FileRow";
import React, { useState, useEffect } from "react";

// The main component for displaying the content of the current directory and managing files and folders.
function MainContent() {
  const [fileName, setFileName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [filesList, setFilesList] = useState([]); // List of files and folders in the current directory.
  const [isEditing, setIsEditing] = useState(false); // Flag to indicate if a file is being edited.

  // State for managing navigation within the filesystem.
  const [systemPath, setSystemPath] = useState("root");
  const [activeFolder, setActiveFolder] = useState("");

  // State for managing sorting of files and folders.
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Fetch the content of the root directory on component mount and when the systemPath changes.
  useEffect(() => {
    getFolderContent(systemPath);
  }, []);

  // Function to display files and folders in the current directory by path.
  const getFolderContent = async (path) => {
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`/api/folder/${encodedPath}`);
    if (response.ok) {
      const data = await response.json();
      setSystemPath(path);
      setFilesList(data.files);
    }
  };

  // Function to change the directory.
  const changeFolder = async (current_path, folder_name) => {
    const newUrl = `${current_path}/${folder_name}`;
    setActiveFolder(folder_name);
    getFolderContent(newUrl);
  };

  // Function to handle the creation of a new file.
  const createFile = async () => {
    try {
      const response = await fetch("/api/file/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName,
          path: systemPath,
          content: fileContent,
        }),
      });
      if (!response.ok) throw new Error("Failed to create the file.");
      getFolderContent(systemPath);
    } catch (error) {
      console.error("Error creating file:", error);
      alert("Error creating file.");
    } finally {
      setFileName("");
      setFileContent("");
      setSortColumn(null);
      setSortDirection("asc");
    }
  };

  // Function to handle the creation of a new folder.
  const createFolder = async () => {
    try {
      const response = await fetch("/api/folder/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
          path: systemPath,
        }),
      });
      if (!response.ok) throw new Error("Failed to create the folder.");
      getFolderContent(systemPath);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder.");
    } finally {
      setFolderName("");
      setSortColumn(null);
      setSortDirection("asc");
    }
  };

  // Function to start editing an existing file.
  const startEditingFile = async (fileName, filePath) => {
    const encodedFilePath = encodeURIComponent(filePath);
    const encodedFileName = encodeURIComponent(fileName);
    const url = `/api/file/read?file_path=${encodedFilePath}&file_name=${encodedFileName}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setFileName(data.name);
        setFileContent(data.content);
        setIsEditing(true);
      })
      .catch((error) => console.error("Error", error));
  };

  // Function to cancel editing mode.
  const cancelEditing = () => {
    setIsEditing(false);
    setFileName("");
    setFileContent("");
  };

  // Function to update an existing file.
  const updateFile = async () => {
    await fetch("/api/file/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fileName,
        path: systemPath,
        content: fileContent,
      }),
    });
    setIsEditing(false);
    setFileName("");
    setFileContent("");
    getFolderContent(systemPath);
  };

  // Function to delete an existing file.
  const deleteFile = async (filePath, fileName) => {
    try {
      const encodedFilePath = encodeURIComponent(filePath);
      const encodedFileName = encodeURIComponent(fileName);
      const url = `/api/file/delete?file_path=${encodedFilePath}&file_name=${encodedFileName}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Some code for notification

      setIsEditing(false);
      setFileName("");
      setFileContent("");
      getFolderContent(systemPath);
    } catch (error) {
      console.error("Error", error);
    }
  };

  // Function to sort files and folders.
  const sortFiles = (column) => {
    const direction =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);

    const sortedFiles = [...filesList].sort((a, b) => {
      if (column === "name") {
        return direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (column === "size") {
        return direction === "asc" ? a.size - b.size : b.size - a.size;
      } else {
        const dateA = new Date(a[column]);
        const dateB = new Date(b[column]);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    setFilesList(sortedFiles);
  };

  const renderSortIndicator = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? "/\\" : "\\/";
    }
    return "";
  };

  // Function to handle file or folder selection.
  const handleFileSelect = (file) => {
    if (file.type === "FILE") {
      startEditingFile(file.name, file.path);
    } else {
      changeFolder(file.path, file.name);
    }
  };

  return (
    <Container className="py-5">
      <Breadcrumb>
        <Breadcrumb.Item
          onClick={() => {
            setActiveFolder("");
            getFolderContent("root");
          }}
        >
          Root
        </Breadcrumb.Item>
        {activeFolder && (
          <Breadcrumb.Item active>{activeFolder}</Breadcrumb.Item>
        )}
      </Breadcrumb>

      <Row>
        <Col xs={8}>
          <Table hover responsive>
            <thead>
              <tr>
                <th onClick={() => sortFiles("name")}>
                  Name {renderSortIndicator("name")}
                </th>
                <th>Created At</th>
                <th>Modified At</th>
                <th onClick={() => sortFiles("size")}>
                  Size {renderSortIndicator("size")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filesList.map((file) => (
                <FileRow
                  key={file.name}
                  file={file}
                  onFileSelect={() => handleFileSelect(file)}
                />
              ))}
            </tbody>
          </Table>
        </Col>
        <Col>
          <Form.Control
            type="text"
            placeholder="File name"
            className="mb-3"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isEditing}
          />

          <Form.Control
            as="textarea"
            rows={3}
            placeholder="File content"
            className="mb-4"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />
          {isEditing ? (
            <>
              <Button variant="primary" type="submit" onClick={updateFile}>
                Update File
              </Button>{" "}
              <Button
                variant="danger"
                type="submit"
                onClick={() => deleteFile(systemPath, fileName)}
              >
                Delete File
              </Button>{" "}
              <Button variant="light" type="submit" onClick={cancelEditing}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              type="submit"
              onClick={createFile}
              disabled={!fileName.length}
            >
              Create File
            </Button>
          )}

          <hr className="my-4"></hr>
          <Form.Control
            type="text"
            value={folderName}
            placeholder="Folder name"
            className="mb-3"
            required
            onChange={(e) => setFolderName(e.target.value)}
          />
          <Button
            variant="secondary"
            type="submit"
            onClick={createFolder}
            disabled={!folderName.length}
          >
            Create Folder
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default MainContent;
