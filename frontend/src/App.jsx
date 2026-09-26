import AppRoutes from "./routes/AppRoutes.jsx";
import OperationBoundary from "./components/common/OperationBoundary.jsx";

function App() {
  return <OperationBoundary><AppRoutes /></OperationBoundary>;
}

export default App;
