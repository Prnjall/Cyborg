import styles from './GlitchText.module.css'

type Props = {
  text: string
  color: 'white' | 'cyan' | 'red' | 'chrome'
  className?: string
}

export const GlitchText = ({ text, color, className }: Props) => {
  return (
    <span
      className={`${styles.glitch} ${styles[color]} ${className ?? ''}`}
      data-text={text}
    >
      {text}
    </span>
  )
}
