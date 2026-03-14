import { useNavigate } from "react-router-dom";

function Signout() {
  const navigate = useNavigate();

  const handleSignout = () => {
    // remove login data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login page
    navigate("/login");
  };

  return (
    <button onClick={handleSignout} style={styles.btn}>
      Sign Out
    </button>
  );
}

const styles = {
  btn: {
    backgroundColor: "#FF6B6B",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Signout;
