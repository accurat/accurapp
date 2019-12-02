import React from 'react'
import { observer } from 'mobx-react'
import { ReactComponent as Logo } from 'images/logo.svg'
// test packages written for newer node version
import ky from 'ky'
import mmm from 'images/mmmpiselli.jpg'
import styles from './App.module.css'

// test decorators
@observer
export class App extends React.Component {
  // test class properties
  state = {}

  render() {
    // test object spread
    const { ...props } = this.props

    // test delicate packages
    console.log(ky)

    return (
      <div {...props}>
        {/* test svgs */}
        <Logo className="w5" />

        {/* test images */}
        <img src={mmm} className="fixed top-0 right-0" />

        {/* test css modules */}
        <div className={styles.text}>Hello world</div>
      </div>
    )
  }
}
