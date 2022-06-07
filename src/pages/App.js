import { useDispatch, useSelector } from "react-redux";



function App() {
  // вызов store из Provider (обычно вызывается кусок store)
  const store = useSelector(store => store);
  const dispatch = useDispatch();

  console.log(store);

  return (
    <div className="App">
      redux-saga tutorial
      {/* <button
        onClick={() => dispatch({type: 'LOAD_DATA'})}
      >click me</button> */}
    </div>
  );
}

export default App;
