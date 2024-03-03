/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Grid, Typography, TextField, Button, Paper, List, ListItem, ListItemButton, ListItemText, Stack } from '@mui/material';

const ChatPage = ({ usersList, socket, username }) => {
	const [selectedUser, setSelectedUser] = useState('');
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (socket) {
			const handleNewMessage = (data) => {
				setMessages((prevMessages) => [...prevMessages, data]);
			};

			const notFound = (data) => {
				toast.info(data.message)
			}

			socket.on('new_message', handleNewMessage);
			socket.on('not_found', notFound);

			// Clean up previous event listener
			return () => {
				socket.off('new_message', handleNewMessage);
				socket.off('not_found', notFound);
			};
		}
	}, [socket]);

	const handleMessageChange = (event) => {
		setMessage(event.target.value);
	};

	const handleSendMessage = () => {
		if (message.trim() === '') {
			toast.error('Please enter a message!');
		} else if (!selectedUser) {
			toast.error('Please select a user to send the message!');
		} else {
			const sender = username;
			socket.emit('send_message', { sender, receiver: selectedUser, message });
			setMessages([...messages, { sender, message }]);
			setMessage('');
		}
	};

	const handleUserSelect = (user) => {
		setSelectedUser(user);
		toast.success(`Selected user: ${user}`);
	};

	return (

		<Grid container spacing={2}>
			<Grid item xs={4}>
				<Typography variant='subtitle1' color='primary'>Logged In {username}</Typography>
				<Typography variant="subtitle2">Joined Users</Typography>
				<List component={Paper} dense sx={{ p: 2, minHeight: 400 }}>
					{usersList.filter(user => user !== username).map((user) => (
						<ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }} disablePadding key={user} >
							<ListItemButton selected={user === selectedUser} onClick={() => handleUserSelect(user)}>
								<ListItemText primary={user} />
							</ListItemButton>
						</ListItem>
					))}

				</List>

			</Grid>
			<Grid item xs={8}>
				{/* Right side: Message content */}
				<Typography variant="h6" mb={2}>Chat {selectedUser}</Typography>
				<Stack component={Paper} style={{ overflowY: 'auto', padding: '8px', minHeight: 400, }}>

					<Stack sx={{ flex: 1, marginTop: 'auto' }}>
						{messages.map((msg, index) => (
							<div key={index} style={{ marginBlock: 8, textAlign: msg.sender === username ? 'right' : 'left', }}>
								<Paper elevation={1} style={{ backgroundColor: msg.sender === username ? '#d8f4ff' : '#ebebeb', maxWidth: 200, display: 'inline-block', padding: "4px 16px" }}>
									<Typography variant="body1">
										<strong>{msg.sender}:</strong> {msg.message}
									</Typography>
								</Paper>
							</div>
						))}
					</Stack>
					<Stack px={2} borderRadius={2} direction='row' alignItems='center' border='1px solid' borderColor="divider">
						<TextField
							variant="standard"
							margin="normal"
							fullWidth
							id="message"
							name="message"
							value={message}
							onChange={handleMessageChange}
						/>
						{/* Send message button */}
						<Button
							type="button"
							variant="contained"
							color="primary"
							onClick={handleSendMessage}
						>
							Send
						</Button>
					</Stack>

				</Stack>
				{/* Message input field */}


			</Grid>
		</Grid >

	);
};

export default ChatPage;
