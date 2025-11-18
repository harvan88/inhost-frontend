import Workspace from '@components/workspace/Workspace';
import './styles/App.css';

/**
 * App - Root component
 *
 * Now using Workspace layout instead of Dashboard
 * for multi-tab, VS Code-style interface
 */
function App() {
  return <Workspace />;
}

export default App;
