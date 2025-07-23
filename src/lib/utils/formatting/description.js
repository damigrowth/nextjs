export const formatDescription = (text) => {
  const desc = text
    .split('\n')
    .map((text, index) =>
      text.trim() !== '' ? (
        <p key={index}>{text}</p>
      ) : (
        <div key={index} className='line-break'></div>
      ),
    );

  return desc;
};
