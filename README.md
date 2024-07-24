# Real-Time Chat Application

A simple, real-time chat application built with Next.js and Socket.IO. This application allows users to join a chat room, see other online users, and engage in private conversations.

## Features

- Real-time messaging using Socket.IO
- User presence (online/offline status)
- Private messaging between users
- Typing indicators
- Responsive design using Tailwind CSS

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone git@github.com:Raccoon254/nextjs-chat-application.git
   ```
    or
    ```
    git clone https://github.com/Raccoon254/nextjs-chat-application.git
    ```

2. Navigate to the project directory:
   ```
   cd nextjs-chat-application
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your name and click "Join" to enter the chat room.
2. You'll see a list of other online users on the left side of the screen.
3. Click on a user's name to start a private conversation with them.
4. Type your message in the input field at the bottom and click "Send" or press Enter to send the message.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.