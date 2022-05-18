import React, { useEffect, useRef, useState } from 'react';

export default () => {
  const [text, setText] = useState()
  const [name, setName] = useState()
  const [top, setTop] = useState('1em')
  const obj = useRef(null)

  const texts = {
    Grower: <p>Produces the raw materials for production of the substance.</p>,
    Supplier: <p>Processes the raw materials into a consumable form.</p>,
    Supply: <p>The final product is a large quantity of the consumable.</p>,
    Unboxing: <>
      <p>The plug receives a part of the supply and measures the amount received.</p>
      <p><i>This is recorded for potential disputes with the supplier.</i></p>
    </>,
    Testing: <>
      <p>The plug performs available tests on the supply.</p>
      <p><i>This is recorded for the customer and supplier.</i></p>
    </>,
    Packaging: <>
      <p>The plug divides the supply into smaller units.</p>
      <p><i>Each packaging is recorded for inclusion in the inventory.</i></p>
    </>,
    Bundling: <p>Packages are labeled with GUIDs and gathered in a locked bundle.</p>,
    Drop: <p>A courier picks up the bundle.</p>,
    Rideshare: <>
      <p>Customers select their pick-up and destination areas.</p>
    </>,
    Shopping: <>
      <p>On an in-car tablet, they communicate with a plug as to inventory.</p>
      <p><i>The shop includes the testing and packaging recordings for each parcel.</i></p>
    </>,
    Payment: <p>Payment for a parcel is transmitted via IOTA.</p>,
    Fulfillment: <p>The courier gives the customer their purchase.</p>,
  }

  const svgEvents = () => {
    obj.current.addEventListener(
      'load',
      () => {
        let svg = obj.current.contentDocument.querySelector('svg')
        if(!svg) { alert("Couldn't find SVG.") }
        let nodes = svg.querySelectorAll("[*|label='Icons'] > *")
        console.info  (nodes)
        if(!nodes || nodes.length === 0) { alert("Couldn't find nodes.") }
        const ns = 'http://www.inkscape.org/namespaces/inkscape'
        for(let node of nodes) {
          const name = node.getAttributeNS(ns, 'label')
          let desc, idx = 0
          for(let key in texts) { // relies on non-standard order maintenance
            desc = texts[key]
            if(key === name) break
            idx++
          }
          if(idx === Object.keys(texts).length) {
            desc = undefined
          }

          let marginTop = '20em'
          const row = Math.floor(idx / 3)
          switch(row) {
            case 0: marginTop = '30%'; break
            case 1: marginTop = '15%'; break
            case 2: marginTop = '25em'; break
            case 3: marginTop = '65%'; break
            default: marginTop = `${row * 25}em`
          }

          node.addEventListener(
            'mouseover',
            () => {
              if(!desc) {
                alert(`Couldn't Find: ${name}`)
              } else {
                setName(name)
                setText(desc)
                setTop(marginTop)
              }
            },
            true
          )
          node.addEventListener(
            'mouseout',
            () => {
              setName(undefined)
              setText(undefined)
            },
            true
          )
        }
      },
      true
    )
  }
  useEffect(svgEvents, [])

  const hide = () => {
    setText(undefined)
  }

  return <>
    {text && (
      <div onClick={hide} style={{ textAlign: 'center', padding: '1em', left: 0, right: 0, position: 'absolute', margin: 'auto', maxWidth: '45em', top: top, backgroundColor: 'yellow', border: '2px solid black', borderRadius: '1.5em' }}>
        <h1>{name}</h1>
        {text}
      </div>
    )}
    <object
      id='chain'
      data='chain.svg'
      ref={obj}
      style={{ display: 'block', maxWidth: '45em', margin: 'auto' }}
      aria-label="Chain"
    />
  </>
}