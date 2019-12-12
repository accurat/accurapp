import React from 'react'
import { observer } from 'mobx-react'
// test packages written for newer node version
import ky from 'ky'
import { ReactComponent as Logo } from '../images/logo.svg'
import mmm from '../images/mmmpiselli.jpg'
import styles from './App.module.css'

export function firstDayOfYear(year: number): Date {
  return new Date(Date.UTC(year, 0, 1))
}

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
