import React from "react";
import Navbar from "../Components/Navbar";

function Messages() {
  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.chatContainer}>
        {/* LEFT CONVERSATION LIST */}
        <div style={styles.left}>
          <p><b>Conversation list</b></p>
        </div>

        {/* RIGHT CHAT WINDOW */}
        <div style={styles.right}>
          <p><b>Chat Window</b></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #F8EDEB, #E9F7D8)",
  },

  chatContainer: {
    display: "flex",
    height: "75vh",
    margin: "40px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },

  left: {
    width: "40%",
    borderRight: "1px solid #ddd",
    padding: "20px",
  },

  right: {
    width: "60%",
    padding: "20px",
  },
};

export default Messages;
