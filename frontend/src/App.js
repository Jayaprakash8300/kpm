import "./App.css";
import Header from "./component/Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { setDataProduct } from "./redux/productSlide";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch()

  useEffect(()=>{
    (async()=>{
      const res = await fetch("http://localhost:8000/product")
      const resData = await res.json()
      dispatch(setDataProduct(resData))
    })()
  },[dispatch])

  return (
    <>
      <Toaster />
      <div>
        <Header />
        <main className="pt-16 bg-slate-100 min-h-[calc(100vh)]">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
