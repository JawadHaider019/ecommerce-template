const Title = ({ text1, text2 }) => {
  return (
    <div className="mb-1">
      <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 tracking-[-0.06em]">
        {text1} {text2}
      </h1>
    </div>
  )
}
export default Title
