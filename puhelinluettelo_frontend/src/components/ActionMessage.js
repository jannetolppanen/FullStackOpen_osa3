import React from 'react'
//message contains message.text as the message and message.css with the css style that defines the color. using inline css style to set color

const ActionMessage = ({ message }) => {
  if (message.text === '') {
    return null
  }

  const cssStyle = {
    color: message.css
  }

  return (
    <div style={cssStyle} className="actionmessage">
      {message.text}
    </div>
  )
}

export default ActionMessage