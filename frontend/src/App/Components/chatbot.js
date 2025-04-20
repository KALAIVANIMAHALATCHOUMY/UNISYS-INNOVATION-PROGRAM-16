import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Drawer,
  Avatar,
  Tooltip,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  CssBaseline,
  Button,
  Fab
} from "@mui/material";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { setUserSystemConversations, Conversation } from "../../LocalStore/allSlice";
import { TypeWritterEffect } from "./Typewritter";


export default function ChatBotApp() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", message: "Hi there! How can I assist you today?" },
    { sender: "user", message: "I need help with uploading documents." }
  ]);

  const dispatch = useDispatch();
  const userSystemConversationsFromRedux = useSelector((state) => state.userSystemConversations);
  console.log("userSystemConversationsFromRedux", userSystemConversationsFromRedux);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleFileUploadClick = () => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatHistory([...chatHistory, { sender: "user", message: inputMessage }]);
    dispatch(setUserSystemConversations(inputMessage ));
    dispatch(Conversation( inputMessage ));
    setInputMessage("");
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HR Agent
          </Typography>
          <Button color="inherit" onClick={handleClearChat}>Clear Chat</Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Searches</Typography>
          <List>
            <ListItem button><ListItemText primary="How to integrate GPT?" /></ListItem>
            <ListItem button><ListItemText primary="Upload PDF to chatbot" /></ListItem>
            <ListItem button><ListItemText primary="ReactJS API call" /></ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Profile</Typography>
          <List>
            <ListItem button>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Chat Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s',
          ml: isSidebarOpen && !isMobile ? '250px' : 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        <Toolbar />

        {/* Chat Messages */}
        <Box flex={1} overflow="auto" mb={1} px={2} id="chat-container">
          {userSystemConversationsFromRedux?.map((msg, index) => (
            console.log(msg.sender, msg.message),
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
              mb={2}
            >
              {msg.sender === "bot" && <Avatar sx={{ mr: 1 }}><SmartToyIcon /></Avatar>}
              <Box
                p={2}
                bgcolor={msg.sender === "bot" ? "#f0f0f0" : "#e3f2fd"}
                borderRadius={2}
                maxWidth="75%"
                mr={msg.sender === "user" ? 1 : 0}
              >
                <TypeWritterEffect  text={msg.message} typeUserorBot={msg.sender} />
                {/* {msg.message} */}
                {/* {msg.message.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))} */}
              </Box>
              {msg.sender === "user" && <Avatar><PersonIcon /></Avatar>}
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Scroll Up Button */}
        

        {/* Input area */}
        {/* <Divider /> */}
        <Box px={isSidebarOpen && !isMobile ? 2 : 3} pb={2} pr={20}>
        <Paper elevation={0} sx={{ p: 1, display: 'flex', alignItems: 'center', boxShadow: 'none' }}>
            <Tooltip title="Attach File">
              <IconButton onClick={handleFileUploadClick}>
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <TextField
              variant="outlined"
              placeholder="Type your message..."
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              sx={{ mx: 1 }}
            />
            <Tooltip title="Send">
              <IconButton color="primary" onClick={handleSendMessage}>
                <SendIcon />
              </IconButton>
            </Tooltip>
            <Fab
          size="small"
          color="primary"
          aria-label="scroll to top"
          onClick={() => document.getElementById('chat-container')?.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ position: 'absolute', bottom: 90, right: 24 }}
        >
          <ArrowUpwardIcon />
        </Fab>
            <input
              type="file"
              ref={(ref) => setFileInputRef(ref)}
              style={{ display: 'none' }}
              onChange={(e) => console.log("File uploaded:", e.target.files[0])}
            />
            
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}


// import React, { useState } from "react";
// import {
//   TextField,
//   IconButton,
//   Paper,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Box,
//   Drawer,
//   Avatar,
//   Tooltip,
//   AppBar,
//   Toolbar,
//   Typography,
//   useMediaQuery,
//   CssBaseline,
//   Button
// } from "@mui/material";
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import SendIcon from '@mui/icons-material/Send';
// import SettingsIcon from '@mui/icons-material/Settings';
// import MenuIcon from '@mui/icons-material/Menu';
// import PersonIcon from '@mui/icons-material/Person';
// import SmartToyIcon from '@mui/icons-material/SmartToy';
// import LogoutIcon from '@mui/icons-material/Logout';
// import { useTheme } from "@mui/material/styles";

// export default function ChatBotApp() {
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const [fileInputRef, setFileInputRef] = useState(null);
//   const [chatHistory, setChatHistory] = useState([
//     { sender: "bot", message: "Hi there! How can I assist you today?" },
//     { sender: "user", message: "I need help with uploading documents." }
//   ]);
//   const [inputMessage, setInputMessage] = useState("");

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const toggleSidebar = () => {
//     setSidebarOpen(!isSidebarOpen);
//   };

//   const handleFileUploadClick = () => {
//     if (fileInputRef) {
//       fileInputRef.click();
//     }
//   };

//   const handleSendMessage = () => {
//     if (!inputMessage.trim()) return;
//     setChatHistory([...chatHistory, { sender: "user", message: inputMessage }]);
//     setInputMessage("");
//   };

//   const handleClearChat = () => {
//     setChatHistory([]);
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100vh" }}>
//       <CssBaseline />

//       {/* AppBar */}
//       <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
//         <Toolbar>
//           <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             ChatBot Assistant
//           </Typography>
//           <Button color="inherit" onClick={handleClearChat}>Clear Chat</Button>
//         </Toolbar>
//       </AppBar>

//       {/* Sidebar */}
//       <Drawer
//         variant={isMobile ? "temporary" : "persistent"}
//         anchor="left"
//         open={isSidebarOpen}
//         onClose={toggleSidebar}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           width: 250,
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: 250,
//             boxSizing: 'border-box',
//           },
//         }}
//       >
//         <Toolbar />
//         <Box sx={{ p: 2 }}>
//           <Typography variant="h6" gutterBottom>Recent Searches</Typography>
//           <List>
//             <ListItem button>
//               <ListItemText primary="How to integrate GPT?" />
//             </ListItem>
//             <ListItem button>
//               <ListItemText primary="Upload PDF to chatbot" />
//             </ListItem>
//             <ListItem button>
//               <ListItemText primary="ReactJS API call" />
//             </ListItem>
//           </List>
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6" gutterBottom>Profile</Typography>
//           <List>
//             <ListItem button>
//               <ListItemIcon><PersonIcon /></ListItemIcon>
//               <ListItemText primary="My Profile" />
//             </ListItem>
//             <ListItem button>
//               <ListItemIcon><LogoutIcon /></ListItemIcon>
//               <ListItemText primary="Logout" />
//             </ListItem>
//           </List>
//         </Box>
//       </Drawer>

//       {/* Chat Area */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           transition: 'margin 0.3s',
//           ml: isSidebarOpen && !isMobile ? '250px' : 0,
//           display: 'flex',
//           flexDirection: 'column',
//           height: '100vh'
//         }}
//       >
//         <Toolbar />

//         {/* Chat Messages */}
//         <Box flex={1} overflow="auto" mb={1} px={2}>
//           {chatHistory.map((msg, index) => (
//             <Box
//               key={index}
//               display="flex"
//               alignItems="center"
//               justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
//               mb={2}
//             >
//               {msg.sender === "bot" && <Avatar sx={{ mr: 1 }}><SmartToyIcon /></Avatar>}
//               <Box
//                 p={2}
//                 bgcolor={msg.sender === "bot" ? "#f0f0f0" : "#e3f2fd"}
//                 borderRadius={2}
//                 maxWidth="75%"
//                 mr={msg.sender === "user" ? 1 : 0}
//               >
//                 {msg.message}
//               </Box>
//               {msg.sender === "user" && <Avatar><PersonIcon /></Avatar>}
//             </Box>
//           ))}
//         </Box>

//         {/* Input area */}
//         <Box px={2} pb={2} pl={0}>
//           <Paper elevation={2} square sx={{ p: 1, display: 'flex', alignItems: 'center'}}>
//             <Tooltip title="Attach File">
//               <IconButton onClick={handleFileUploadClick}>
//                 <AttachFileIcon />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="Settings">
//               <IconButton>
//                 <SettingsIcon />
//               </IconButton>
//             </Tooltip>
//             <TextField
//               variant="outlined"
//               placeholder="Type your message..."
//               fullWidth
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   handleSendMessage();
//                 }
//               }}
//               sx={{ mx: 1 }}
//             />
//             <Tooltip title="Send">
//               <IconButton color="primary" onClick={handleSendMessage}>
//                 <SendIcon />
//               </IconButton>
//             </Tooltip>
//             <input
//               type="file"
//               ref={(ref) => setFileInputRef(ref)}
//               style={{ display: 'none' }}
//               onChange={(e) => console.log("File uploaded:", e.target.files[0])}
//             />
//           </Paper>
//         </Box>
//       </Box>
//     </Box>
//   );
// }


// import React, { useState } from "react";
// import {
//   TextField,
//   IconButton,
//   Paper,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   Drawer,
//   Avatar,
//   Tooltip,
//   AppBar,
//   Toolbar,
//   Typography,
//   useMediaQuery,
//   CssBaseline
// } from "@mui/material";
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import SendIcon from '@mui/icons-material/Send';
// import SettingsIcon from '@mui/icons-material/Settings';
// import MenuIcon from '@mui/icons-material/Menu';
// import PersonIcon from '@mui/icons-material/Person';
// import SmartToyIcon from '@mui/icons-material/SmartToy';
// import { useTheme } from "@mui/material/styles";

// export default function ChatBotApp() {
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const [fileInputRef, setFileInputRef] = useState(null);

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const toggleSidebar = () => {
//     setSidebarOpen(!isSidebarOpen);
//   };

//   const handleFileUploadClick = () => {
//     if (fileInputRef) {
//       fileInputRef.click();
//     }
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100vh" }}>
//       <CssBaseline />
//       {/* AppBar */}
//       <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
//         <Toolbar>
//           <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             ChatBot Assistant
//           </Typography>
//         </Toolbar>
//       </AppBar>

//       {/* Sidebar */}
//       <Drawer
//         variant={isMobile ? "temporary" : "persistent"}
//         anchor="left"
//         open={isSidebarOpen}
//         onClose={toggleSidebar}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           width: 250,
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: 250,
//             boxSizing: 'border-box',
//           },
//         }}
//       >
//         <Toolbar />
//         <Box sx={{ p: 2 }}>
//           <Typography variant="h6" gutterBottom>Recent Searches</Typography>
//           <List>
//             <ListItem button>
//               <ListItemText primary="How to integrate GPT?" />
//             </ListItem>
//             <ListItem button>
//               <ListItemText primary="Upload PDF to chatbot" />
//             </ListItem>
//             <ListItem button>
//               <ListItemText primary="ReactJS API call" />
//             </ListItem>
//           </List>
//         </Box>
//       </Drawer>

//       {/* Chat Area */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           ml: isSidebarOpen && !isMobile ? '250px' : 0,
//           transition: 'margin 0.3s',
//           display: 'flex',
//           flexDirection: 'column',
//           height: '100vh',
//         }}
//       >
//         <Toolbar />

//         {/* Chat Messages */}
//         <Box flex={1} overflow="auto" mb={1}>
//           <Box display="flex" alignItems="center" mb={2}>
//             <Avatar sx={{ mr: 1 }}><SmartToyIcon /></Avatar>
//             <Box p={2} bgcolor="#f0f0f0" borderRadius={2} maxWidth="75%">
//               Hi there! How can I assist you today?
//             </Box>
//           </Box>
//           <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
//             <Box p={2} bgcolor="#e3f2fd" borderRadius={2} maxWidth="75%" mr={1}>
//               I need help with uploading documents.
//             </Box>
//             <Avatar><PersonIcon /></Avatar>
//           </Box>
//         </Box>

//         {/* Input area */}
//         <Divider />
//         <Paper elevation={2} square sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
//           <Tooltip title="Attach File">
//             <IconButton onClick={handleFileUploadClick}>
//               <AttachFileIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Settings">
//             <IconButton>
//               <SettingsIcon />
//             </IconButton>
//           </Tooltip>
//           <TextField
//             variant="outlined"
//             placeholder="Type your message..."
//             fullWidth
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') {
//                 console.log("Message sent:", e.target.value);
//               }
//             }}
//           />
//           <Tooltip title="Send">
//             <IconButton color="primary">
//               <SendIcon />
//             </IconButton>
//           </Tooltip>
//           <input
//             type="file"
//             ref={(ref) => setFileInputRef(ref)}
//             style={{ display: 'none' }}
//             onChange={(e) => console.log("File uploaded:", e.target.files[0])}
//           />
//         </Paper>
//       </Box>
//     </Box>
//   );
// }

// import React, { useState } from "react";
// import {
//   TextField,
//   IconButton,
//   Paper,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   Drawer,
//   Avatar,
//   Tooltip,
//   useMediaQuery
// } from "@mui/material";
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import SendIcon from '@mui/icons-material/Send';
// import SettingsIcon from '@mui/icons-material/Settings';
// import MenuIcon from '@mui/icons-material/Menu';
// import PersonIcon from '@mui/icons-material/Person';
// import SmartToyIcon from '@mui/icons-material/SmartToy';
// import { useTheme } from "@mui/material/styles";

// export default function ChatBotApp() {
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
//   const [fileInputRef, setFileInputRef] = useState(null);

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const toggleSidebar = () => {
//     setSidebarOpen(!isSidebarOpen);
//   };

//   const handleFileUploadClick = () => {
//     if (fileInputRef) fileInputRef.click();
//   };

//   return (
//     <Box display="flex" height="100vh">
//       {/* Sidebar Toggle Button */}
//       <IconButton
//         onClick={toggleSidebar}
//         sx={{
//           position: "fixed",
//           top: 10,
//           left: 10,
//           zIndex: 1301,
//           backgroundColor: "white",
//           boxShadow: 1,
//         }}
//       >
//         <MenuIcon />
//       </IconButton>

//       {/* Sidebar */}
//       <Drawer
//         anchor="left"
//         variant={isMobile ? "temporary" : "persistent"}
//         open={isSidebarOpen}
//         onClose={toggleSidebar}
//         ModalProps={{ keepMounted: true }}
//       >
//         <Box width={250} bgcolor="#f9f9f9" p={2} height="100%">
//           <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Searches</h2>
//           <List>
//             <ListItem button>
//               <ListItemText primary="How to integrate GPT?" />
//             </ListItem>
//             <ListItem button>
//               <ListItemText primary="Upload PDF to chatbot" />
//             </ListItem>
//             <ListItem button>
//               <ListItemText primary="ReactJS API call" />
//             </ListItem>
//           </List>
//         </Box>
//       </Drawer>

//       {/* Chat Area */}
//       <Box
//         flex={1}
//         display="flex"
//         flexDirection="column"
//         ml={!isMobile && isSidebarOpen ? '250px' : 0}
//         transition="margin 0.3s"
//         width="100%"
//       >
//         {/* Chat messages */}
//         <Box flex={1} overflow="auto" p={2}>
//           {/* Bot message */}
//           <Box display="flex" alignItems="center" mb={2}>
//             <Avatar sx={{ mr: 1 }}><SmartToyIcon /></Avatar>
//             <Box p={2} bgcolor="#f0f0f0" borderRadius={2} maxWidth="75%">
//               Hi there! How can I assist you today?
//             </Box>
//           </Box>

//           {/* User message */}
//           <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
//             <Box p={2} bgcolor="#e3f2fd" borderRadius={2} maxWidth="75%" mr={1}>
//               I need help with uploading documents.
//             </Box>
//             <Avatar><PersonIcon /></Avatar>
//           </Box>
//         </Box>

//         {/* Input area */}
//         <Divider />
//         <Paper elevation={2} square sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
//           <Tooltip title="Attach File">
//             <IconButton onClick={handleFileUploadClick}>
//               <AttachFileIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Settings">
//             <IconButton>
//               <SettingsIcon />
//             </IconButton>
//           </Tooltip>
//           <TextField
//             variant="outlined"
//             placeholder="Type your message..."
//             fullWidth
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') {
//                 console.log("Message sent:", e.target.value);
//               }
//             }}
//           />
//           <Tooltip title="Send">
//             <IconButton color="primary">
//               <SendIcon />
//             </IconButton>
//           </Tooltip>
//           <input
//             type="file"
//             ref={(ref) => setFileInputRef(ref)}
//             style={{ display: 'none' }}
//             onChange={(e) => console.log("File uploaded:", e.target.files[0])}
//           />
//         </Paper>
//       </Box>
//     </Box>
//   );
// }
