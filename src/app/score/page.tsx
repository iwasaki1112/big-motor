'use client'

import "./page.scss"
import { useSelector } from "react-redux"
import Image from "next/image";
import { useRouter } from 'next/navigation'

const Score: React.FC = () => {
  const score = useSelector((state: any) => state.scoreReducer.value)
  const router = useRouter()
  
  const handleBackButtonClick = () => {
    router.push("/")
  }
  return (
    <div className="score">
      <Image src="/images/crown.png" alt="crown" width={128} height={160} className="score--crown" />
      <p className="score--description">あなたは<br /><span className="score--point">{score}車</span>にダメージを与えました</p>
      <button className="score--button" onClick={handleBackButtonClick}>戻る</button>
    </div>
  )
}

export default Score