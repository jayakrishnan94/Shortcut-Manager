# Shortcut Manager

## Introduction

Shortcut Manager is a minimalistic web application designed to help you manage and organize your keyboard shortcuts. It allows you to add, edit, search, and list shortcuts. The application stores shortcuts in a local JSON file..

## Features

- Add new shortcuts with title, description, and key combination.
- Detect and display key combinations as shortcuts.
- Edit existing shortcuts.
- Search and filter shortcuts.
- Saves shortcuts in a local JSON file.

## Tech Stack

- **HTML**: For the structure of the application.
- **CSS**: For styling the application.
- **JavaScript**: For functionality including detecting shortcuts, rendering the list, and handling file operations.
- **JSON**: For storing shortcuts locally.

## How to Start

1. **Clone the repository**:

    ```sh
    git clone <repository-url>
    cd shortcut-manager
    ```

2. **Install a local server**: 
   You need a local server to serve the files and handle file operations. You can use a simple server like `http-server` or any other server of your choice.

    ```sh
    npm install -g http-server
    ```

3. **Start the server**:

    ```sh
    http-server
    ```

4. **Open the application**: Open your web browser and navigate to `http://localhost:8080` (or the port where the server is running).

## What and Where to Update

- **Adding Shortcuts**: Update the `script.js` file to handle adding and saving shortcuts.
- **Editing Shortcuts**: Modify the `script.js` file to include editing functionality in the modal.
- **Saving Shortcuts**: The `shortcuts.json` file is used for storing data. Ensure it is properly handled by the server to support POST requests for saving data.
- **Styling**: Update `styles.css` to modify the appearance of the application.

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests. Any contributions are welcome!

## License

This project is licensed under the MIT License.

