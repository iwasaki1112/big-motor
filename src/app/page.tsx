'use client'

import { useRouter } from "next/navigation"
import "./page.scss"

const index = () => {
  const router = useRouter()
  
  const handleGameStartClick = () => {
    router.push("/game")
  }
  
  return (
    <section className="index">
      <h1 className="index--title">
        ビック シューター
      </h1>
      <button className="index--button" onClick={handleGameStartClick}>
        ゲームスタート
      </button>
    </section>
  )
}

export default index