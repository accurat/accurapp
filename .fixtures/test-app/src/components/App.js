import React from 'react'
import { observer } from 'mobx-react'
// text mapbox-gl and uglify ❤️
import mapboxgl from 'mapbox-gl'
// test packages written for newer node version
import ky from 'ky'
import { ReactComponent as Logo } from 'images/logo.svg'
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

    // test optionsl chaining
    const foo = props?.foo

    console.log(foo, mapboxgl, ky)

    // test pipeline operator
    const exclaim = string => `${string}!`
    const message = 'Hello world' |> exclaim

    return (
      <div {...props}>
        {/* test svgs */}
        <Logo className="w5" />

        {/* test images */}
        <img src={mmm} className="fixed top-0 right-0" />

        {/* test css modules */}
        <div className={styles.text}>{message}</div>
      </div>
    )
  }
}
