import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sandbox from "./pages/Sandbox";

import ProtectedRoute from "./routes/ProtectedRoutes";

// Quiz
import Quiz from "./pages/Quiz";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";

// Speed Sorting
import SpeedSorting from "./pages/speed-sorting/SpeedSorting";
import CreateSpeedSorting from "./pages/speed-sorting/CreateSpeedSorting";
import EditSpeedSorting from "./pages/speed-sorting/EditSpeedSorting";

// Anagram
import PlayAnagram from "./pages/anagram/PlayAnagram";
import CreateAnagram from "./pages/anagram/CreateAnagram";
import EditAnagram from "./pages/anagram/EditAnagram";

// Pair or No Pair
import PairOrNoPairGame from "./pages/pair-or-no-pair";
import CreatePairOrNoPair from "./pages/pair-or-no-pair/create";

// Gameshow Quiz ✅
import GameshowQuizPage from "./pages/gameshow-quiz";
import CreateGameshowPage from "./pages/gameshow-quiz/create";
import EditGameshowPage from "./pages/gameshow-quiz/edit";
import PlayGameshowPage from "./pages/gameshow-quiz/play";

// Profile / Project
import ProfilePage from "./pages/ProfilePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import CreateProject from "./pages/CreateProject";

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sandbox" element={<Sandbox />} />

      {/* PLAY PUBLIC */}
      <Route path="/quiz/play/:id" element={<Quiz />} />
      <Route path="/speed-sorting/play/:id" element={<SpeedSorting />} />
      <Route path="/anagram/play/:id" element={<PlayAnagram />} />
      <Route path="/gameshow-quiz/play/:id" element={<PlayGameshowPage />} />
      <Route
        path="/pair-or-no-pair/play/:gameId"
        element={<PairOrNoPairGame />}
      />

      {/* AUTH REQUIRED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-projects" element={<MyProjectsPage />} />
        <Route path="/create-projects" element={<CreateProject />} />

        {/* Quiz */}
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/edit/:id" element={<EditQuiz />} />

        {/* Speed Sorting */}
        <Route
          path="/create-speed-sorting"
          element={<CreateSpeedSorting />}
        />
        <Route
          path="/speed-sorting/edit/:id"
          element={<EditSpeedSorting />}
        />

        <Route path="/create-anagram" element={<CreateAnagram />} />
        <Route path="/anagram/edit/:id" element={<EditAnagram />} />

        <Route
          path="/create-pair-or-no-pair"
          element={<CreatePairOrNoPair />}
        />

        <Route path="/gameshow-quiz" element={<GameshowQuizPage />} />
        <Route
          path="/create-gameshow-quiz"
          element={<CreateGameshowPage />}
        />
        <Route
          path="/gameshow-quiz/edit/:id"
          element={<EditGameshowPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;
