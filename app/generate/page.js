'use client';

import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Box,
  Container,
  Paper,
  DialogActions,
  DialogContentText,
  DialogContent,
  TextField,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
} from "@mui/material";
import { collection, writeBatch, setDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/firebase";
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Aptos Black, sans-serif',
    h2: {
      fontFamily: 'Porkys, sans-serif',
      fontSize: '9.5rem',
    },
    h4: {
      fontSize: '3rem',
      fontWeight: 'bold',
    },
    h5: {
      fontSize: '5rem',
      color: '#E54792',
      fontWeight: 'bold',
    },
  },
  palette: {
    primary: {
      main: '#0F9ED5',
    },
    background: {
      default: '#E5F4FB',
    },
  },
  shape: {
    borderRadius: 2,
  },
});

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [answerType, setAnswerType] = useState("True or False");
  const [difficulty, setDifficulty] = useState("Medium");
  const [lang, setLang] = useState("English");
  const router = useRouter();

  const handleSubmit = async () => {
    fetch("/api/generate", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: text, lang, numFlashcards, difficulty, answerType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.flashcards) {
          setFlashcards(data.flashcards);
        } else {
          console.error('Error:', data.error);
        }
      });
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcard = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      if (collections.find((f) => f.name === name)) {
        alert("Flashcard collection with the same name already exists.");
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { flashcards: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }

    const colRef = collection(userDocRef, name);
    flashcards.forEach((flashcard) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocRef, flashcard);
    });

    await batch.commit();
    handleClose();
    router.push(`/flashcards?id=${name}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: '#E5F4FB', minHeight: '100vh' }}>
        <Container maxWidth="100vw" sx={{ p: 0 }}>
          <Head>
            <title>Memoraize - Generate Flashcards</title>
            <meta name="description" content="Generate flashcards using AI" />
            <link rel="icon" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><text x='8' y='48' font-family='Porkys' font-size='48' fill='%230F9ED5'>M</text><text x='32' y='48' font-family='Porkys' font-size='48' fill='%23E54792'>M</text></svg>" />
          </Head>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar>
              <Button
                onClick={() => router.push('/')}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  mt: 2,
                  ml: 2,
                  padding: 0,
                  minWidth: 'auto',
                  height: 'auto',
                  fontFamily: "Porkys, sans-serif",
                  fontSize: '2.5rem',
                  textTransform: 'none',
                  color: '#0F9ED5',
                  ':after': {
                    content: '"M"',
                    display: 'inline-block',
                    fontFamily: 'Porkys, sans-serif',
                    fontSize: '2.5rem',
                    color: '#0F9ED5',
                    marginRight: '-0.5rem',
                  },
                  ':before': {
                    content: '"M"',
                    display: 'inline-block',
                    fontFamily: 'Porkys, sans-serif',
                    fontSize: '2.5rem',
                    color: '#E54792',
                  }
                }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <SignedOut>
                <Button color="primary" variant="contained" href="/sign-in" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5 }}>
                  Log In
                </Button>
                <Button color="primary" variant="contained" href="/sign-up" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5, ml: 2 }}>
                  Sign Up
                </Button>
              </SignedOut>
              <SignedIn>
                <Button onClick={() => router.push('/flashcards')} variant="contained" sx={{ backgroundColor: '#E54792', color: 'white', fontWeight: 'bold', borderRadius: 5, mr: 2 }}>
                  Your Flashcards
                </Button>
                <UserButton />
              </SignedIn>
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            <Box
              sx={{
                mt: 4,
                mb: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" sx={{ color: '#0F9ED5', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Generate Flashcards
              </Typography>
              <Paper sx={{ p: 4, width: "100%", borderRadius: 5, backgroundColor: '#E5F4FB', boxShadow: 3 }}>
                <TextField
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  label="Enter text"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    label="Language"
                  >
                    {/* Liste des langues */}
                    <MenuItem value="Arabic">Arabic</MenuItem>
                    <MenuItem value="Bengali">Bengali</MenuItem>
                    <MenuItem value="Chinese Mandarin">Chinese Mandarin</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                    <MenuItem value="Italian">Italian</MenuItem>
                    <MenuItem value="Japanese">Japanese</MenuItem>
                    <MenuItem value="Korean">Korean</MenuItem>
                    <MenuItem value="Portuguese">Portuguese</MenuItem>
                    <MenuItem value="Russian">Russian</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                  </Select>
                </FormControl>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      value={numFlashcards}
                      onChange={(e) => setNumFlashcards(e.target.value)}
                      label="Number of Flashcards"
                      type="number"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Answer Type</InputLabel>
                      <Select
                        value={answerType}
                        onChange={(e) => setAnswerType(e.target.value)}
                        label="Answer Type"
                      >
                        <MenuItem value="True or False">True or False</MenuItem>
                        <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
                        <MenuItem value="Short Answer">Short Answer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    label="Difficulty"
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                      backgroundColor: '#E54792',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: 5,
                      textTransform: 'none',
                      width: '200px'
                    }}
                  >
                    Generate
                  </Button>
                </Box>
              </Paper>
              {flashcards.length > 0 && (
                <Box sx={{ mt: 4, width: "100%" }}>
                  <Typography variant="h4" sx={{ mb: 2, color: '#0F9ED5' }}>
                    Flashcards Preview
                  </Typography>
                  <Grid container spacing={2}>
                    {flashcards.map((flashcard, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          onClick={() => handleCardClick(index)}
                          sx={{
                            transform: flipped[index] ? "rotateY(180deg)" : "rotateY(0deg)",
                            transformStyle: "preserve-3d",
                            transition: "transform 0.6s",
                            boxShadow: 3,
                          }}
                        >
                          <CardActionArea>
                            <CardContent
                              sx={{
                                height: 200,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: flipped[index] ? "#E54792" : "#0F9ED5",
                                color: "white",
                                borderRadius: 5,
                                backfaceVisibility: "hidden",
                              }}
                            >
                              <Typography variant="h5">
                                {flipped[index] ? flashcard.answer : flashcard.question}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={handleOpen}
                      variant="contained"
                      sx={{
                        backgroundColor: '#0F9ED5',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 5,
                        textTransform: 'none',
                        width: '200px'
                      }}
                    >
                      Save Flashcards
                    </Button>
                  </Box>
                  <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Save Flashcards</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Please enter a name for your flashcard collection:
                      </DialogContentText>
                      <TextField
                        autoFocus
                        margin="dense"
                        label="Collection Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancel</Button>
                      <Button onClick={saveFlashcard} sx={{ textTransform: 'none' }}>Save</Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              )}
            </Box>
          </Container>
        </Container>
      </Box>
    </ThemeProvider>
  );
}