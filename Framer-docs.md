What are Code Components?
Code Components are React Component that can extend Framers capabilities by rendering directly on the canvas, in the preview, and on your published site. They are written directly in Framer using the built-in code editor and preview. Watch the video below to learn about the principles of creating code components.

Please note, components must use React 18 compatible code.


Core Features
Property Controls – Manipulate component props visually.

Auto-Sizing – Custom sizing options to work well in any layout.

Sharing – Shareable with a unique, versioned URL.

Basics
To create a new code component, go to the assets panel and select Code. Then, click Create Code File. You'll be presented with a new code file that exports a single React component.

Create code file in Framer
To preview your component in real time while editing, click the top right preview button to get a split preview of your work. The preview will automatically refresh when changes to your component are saved. 

Component Examples
Let's look at the very simplest component we could make. That would really just be a vanilla React button component. There really is no magic here, but it already works.

export default function Button(props) {
    return <div>Hello</div>
}
Let’s go a step deeper and add some styling. We can do this the standard React way too with style.

export default function Button(props) {
    const style = {
        display: "inline-block",
        backgroundColor: "orange",
        padding: 8,
    }

    return <div style={style}>Hello</div>
}
Now, let’s make a title prop that is configurable from the interface (we will explain more about property controls later).

import { addPropertyControls, ControlType } from "framer"

export default function Button(props) {
    const style = {
        display: "inline-block",
        backgroundColor: "orange",
        padding: 8,
    }

    return <div style={style}>{props.text}</div>
}

Button.defaultProps = {
    text: "My Title",
}

addPropertyControls(Button, {
    text: {
        title: "Text",
        type: ControlType.String,
    },
})
And there you have a simple configurable React component, right on the canvas. But I hope you can see how you can use the same concepts to build any React component you like. title prop that is configurable from the interface (we will explain more about property controls later).

Component Sharing
All Components in Framer are built on ES Modules. This means that every Smart Component and Code Component has a unique URL that can be shared. You can paste this URL into any Framer project, directly onto the Canvas as if you are pasting an image, and the Component will appear. When pasted they will also be added to the Asset Panel for the Project if not in there already, and will periodically show an “Update” CTA when changes are made to the primary Component. 

To get the URL for your Component, find your Component under Assets → Code Component and right click to “Copy URL…”. Your clipboard will contain a URL like:

# Latest version
https://framer.com/m/Button-5TDo.js

# Specific version
https://framer.com/m/Button-5TDo.js@rXSyWUm5fMakCtp8K3gM
The URL often has an @ followed by a string of characters, this is known as the Version ID. This means the URL will point to the version of your component as the time of copying the URL. This is helpful if you want to keep iterating while ensuring the shared version is stable and working.

Preventing Unlinking
When sharing Components you may not always want people to be able to easily unlink the Code Component, as this can be confusing for people not familiar with code. You can prevent unlinking by adding the @framerDisableUnlink annotation to your Component. You may already be using annotations to control sizing and layout, if so you can add this annotation to the same comment. This comment must be directly above your Component code like this, with no other code in-between.

/**
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 200
 * @framerIntrinsicHeight 200
 */
export default function MyComponent(props) {
  ...
Note: Do not keep sensitive information in your Code Components as preventing unlink does not prevent your code from being seen by people with developer tool knowledge. As with any webpage, if something is rendered on the page, the code can be extracted. 

Auto-Sizing
Framer has the ability to accurately measure any content on the canvas. When building code components, this means you can write styles as you are used to on the web and Framer will figure out the rest.

Defining Component Size
There are four settings for code component layout in Framer: auto, fixed, any, and any-prefer-fixed. These can be set for width or height axis individually, using @framerSupportedLayoutWidth and @framerSupportedLayoutHeight annotations.

auto — The component will dictate its own size based on its content.

fixed — The component is in a fixed size container and can fill 100% of its size.

any — Users can switch between auto and fixed sizing via the properties panel.

any-prefer-fixed — The same as the previous option, but set tofixed by default.

Specifying Options
The default layout setting for all components in Framer is any. To select different layout options for your component you'll need to add an annotation. This annotation is a special comment that Framer reads and uses to accordingly set options for your component. Make sure this comment is on the lines directly above where you declare your component.

The following code will make your component have auto-sizing for width, but not height. You can make these two properties any combination of sizing options as long as you have both width & height specified at all times.

/**
* @framerSupportedLayoutWidth auto
* @framerSupportedLayoutHeight fixed
*/
export function Toggle(props) { ...
Intrinsic Size
These annotations let Framer know what size your component should be inserted into the canvas when fixed sizing is enabled. In this case, it will insert with a width of 200px and a height of 200px.

/**
* @framerIntrinsicHeight 200
* @framerIntrinsicWidth 200
*/
export function Box(props) { ...
Using Auto-Sizing
Now, let’s make a title prop that is configurable from the interface (we will explain more about property controls later).

Supporting the default any
By spreading the style prop into your parent container style properties with {...style}, Framer will override the width and height when auto-sizing is turned off (fixed sizing) by passing down { width: "100%", height: "100%" } via the style prop. While doing this, Framer wraps your component in a fixed-sized container set to the user-defined size on the canvas.

export function Toggle(props) {
    return <div style={{ width: 50, height: 50 }} />
}
Auto-Sizing Dynamically
If you want to auto-size your component based on logic or state changes, using a useLayoutEffect will work best with our measuring system. Generally, you'll want to use this approach when controlling internal state from outside the component.

import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useLayoutEffect } from "react"

/*
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function Test(props) {
    const start = 0
    const [count, setCount] = useState(0)
    
    useLayoutEffect(() => {
        if (start !== count) setCount(start)
    }, [start])
    
    return (
        <div
            style={{ ...containerStyle }}
            onClick={() => {
                setCount(count + 1)
            }}
        >
            {new Array(count).fill(1, 0, count).map((_, index) => {
                return <div style={squareStyle}>{index}</div>
            })}
        </div>
    )
}

const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
}

const squareStyle = {
    margin: 10,
    padding: 50,
    color: "white",
    fontWeight: 600,
    borderRadius: 25,
    backgroundColor: "#09F",
    width: "max-content",
    whiteSpace: "pre-wrap",
    flexShrink: 0,
}
Measuring Absolute Height Width Values
Sometimes when writing components, you may want to know the size of the component in pixels. To do this, you will need to measure the component with a resizeObserver. We have a hook for this you can import called useMeasuredSize. Be careful, as any measurement like this will reduce the performance of your site, as well as your canvas.

import { useMeasuredSize } from "https://framer.com/m/framer/useMeasuredSize.js"

/**
* @framerSupportedLayoutWidth fixed
* @framerSupportedLayoutHeight any
*/
export function ScaledToggle(props) {
  const { style, tint } = props
  
  const container = useRef<HTMLDivElement>()
  const size = useMeasuredSize(container)
  const width = size?.width ?? 50
  const height = size?.height ?? 50

  return (
      <motion.div
        initial={false}
        ref={container}
        animate={{ backgroundColor: tint }}
        style={{ width: 50, height: width * 0.5,  ...style }}
      />
    )
}

Property Controls
Property Controls allow users to pass properties (or props) to a code component through the Framer interface. When a user selects a code component on the canvas, its Property Controls are visible on the properties panel. As a component author, it’s up to you to decide which Property Controls to add and what options they should present to the user.

Adding Controls
To give your component Property Controls, import both the addPropertyControls  function and the ControlType type from the framer library.

Below your component, call the addPropertyControls function with two arguments: first, the name of your component; and second, an object that defines controls for different properties. You have several types of controls to choose from, each of which are documented on this page.

Property Controls only affect components on the canvas. For this reason, you'll still want to use defaultProps for your component’s props, both to prevent errors as you code the component and when a designer creates an instance of your component from code.

In this example, we’re adding a Property Control for our component’s text prop. On the canvas, selecting the component will now display a control that allows us to set this property.

import { addPropertyControls, ControlType } from "framer"

export function MyComponent(props) {
  return <div>{props.text}</div>
}

MyComponent.defaultProps = {
  text: "Hello World!",
}

addPropertyControls(MyComponent, {
  text: { type: ControlType.String, title: "Hello World" },
})
Hiding Controls
Controls can be hidden by adding the hidden function to the property description. The function receives an object containing the set properties and returns a boolean. In this example, we hide the text property entirely when the connected property (the toggle) is false. Now you can toggle the visibility of the text property control by changing the toggle boolean from within the property panel in Framer.

export function MyComponent(props) {
  return <div>{props.text}</div>
}

MyComponent.defaultProps = {
  text: "Hello World!",
  toggle: true,
}

addPropertyControls(MyComponent, {
  toggle: {
    type: ControlType.Boolean,
    title: "Toggle",
    enabledTitle: "Show",
    disabledTitle: "Hide",
  },
  text: {
    type: ControlType.String,
    title: "Text",
    hidden(props) {
      return props.toggle === false
    },
  },
})

Adding Descriptions
Controls can have a description property to add documentation about the control in the Framer UI—it appears in the Properties panel just above the control. It also supports adding emphasis and links using Markdown syntax. To add line breaks, use the newline character “\n”.

export function MyComponent(props) {
  return <div>{props.text}</div>
}

MyComponent.defaultProps = {
  text: "Hello World!",
  toggle: true,
}

addPropertyControls(MyComponent, {
  toggle: {
    type: ControlType.Boolean,
    title: "Toggle",
    description: "*On* by default",
  },
  text: {
    type: ControlType.String,
    title: "Text",
    description: "[Need inspiration?](https://www.lipsum.com)",
  },
})
Controls
Array ControlType.Array
A control that allows multiple values per ControlType, provided as an array via properties. For most control types this will be displayed as an additional section in the properties panel allowing as many fields to be provided as required.

For a ControlType.ComponentInstance the component will also gain an additional outlet control on the Canvas that allows links to be created between frames.

Group properties together by using an object control.

export function MyComponent(props) {
  const frames = props.images.map(image => {
    return <img src={image} style={{ width: 50, height: 50 }} />
  })
  
  return <div style={{ display: "flex", gap: 10 }}>{frames}</div>
}

// Add a repeatable image property control
addPropertyControls(MyComponent, {
  images: {
    type: ControlType.Array,
    control: {
      type: ControlType.Image
    },
    // Allow up to five items
    maxCount: 5,
  },
})

// Add a multi-connector to your component to connect components on the canvas
addPropertyControls(MyComponent, {
  children: {
    type: ControlType.Array,
    control: {
      type: ControlType.ComponentInstance
    },
    maxCount: 5,
  },
})

// Add a list of objects
addPropertyControls(MyComponent, {
  myArray: {
    type: ControlType.Array,
    control: {
      type: ControlType.Object,
      controls: {
        title: { type: ControlType.String, defaultValue: "Employee" },
        avatar: { type: ControlType.Image },
      },
    },
    defaultValue: [
      { title: "Jorn" },
      { title: "Koen" },
    ],
  },
})

// For multiple values, you can pass in an array of single values as the React default prop.
MyComponent.defaultProps = {
   paddings: [5, 10, 15],
}
Boolean ControlType.Boolean
A control that displays an on / off checkbox. The associated property will be true or false , depending on the state of the checkbox. Includes an optional defaultValue, which is set to true by default.

export function MyComponent(props) {
    return (
        <div style={{ minHeight: 50, minWidth: 50 }}>
            {props.showText ? "Hello World" : null}
        </div>
    )
}

addPropertyControls(MyComponent, {
  showText: {
    type: ControlType.Boolean,
    title: "Show Text",
    defaultValue: true,
  },
})
Color ControlType.Color
A control that represents a color value. It will be included in the component props as a string.

This control is displayed as a color field and will provide the selected color in either RGB (rgb(255, 255, 255)) or RGBA (rgba(255, 255, 255, 0.5) notation, depending on whether there is an alpha channel.

You can also make the color optional by adding the optional property.

export function MyComponent(props) {
  return (
    <div
      style={{
        backgroundColor: props.background,
        width: 50,
        height: 50,
      }}
    />
  )
}

addPropertyControls(MyComponent, {
  background: {
    type: ControlType.Color,
    defaultValue: "#fff",
    optional: true,
  },
})
ComponentInstance ControlType.ComponentInstance
A control that references to another component on the canvas, included in the component props as a React node. The component will have an outlet to allow linking to other Frames. Available Frames will also be displayed in a dropdown menu in the properties panel. The component reference will be provided as a property. As a convention, the name for the property is usually just children.

Multiple components can be linked by combining the ComponentInstance type with the ControlType.Array.

export function MyComponent(props) {
  return <div>{props.children}</div>
}

addPropertyControls(MyComponent, {
  children: {
    type: ControlType.ComponentInstance,
  },
})
Date ControlType.Date
A property control that represents a date. The date will be passed in as an ISO 8601 formatted string.

export function MyComponent(props) {
  return <div>{props.date}</div>
}

addPropertyControls(MyComponent, {
    date: {
        type: ControlType.Date,
        title: "Date"
    },
})
Enum ControlType.Enum
A property control that represents a list of options. The list contains primitive values and each value has to be unique. The selected option will be provided as a property. This control is displayed as a dropdown menu in which a user can select one of the items. displaySegmentedControl can be enabled to display a segmented control instead.

Note: ControlType.SegmentedEnum is deprecated, please use ControlType.Enum and enable displaySegmentedControl.

export function MyComponent(props) {
  const value = props.value || "a"
  const colors = { a: "red", b: "green", c: "blue" }
  return (
    <div 
      style={{ 
        backgroundColor: colors[value], 
        width: 50, 
        height: 50 
      }}
    >
      {value}
    </div>
  )
}

addPropertyControls(MyComponent, {
  value: {
    type: ControlType.Enum,
    defaultValue: "a",
    displaySegmentedControl: true,
    segmentedControlDirection: "vertical",
    options: ["a", "b", "c"],
    optionTitles: ["Option A", "Option B", "Option C"]
  },
})
EventHandler ControlType.EventHandler
A control that exposes events in the Interactions section of the Properties Panel when used within Smart Components.When selection Interactions such as “New Transition”, you can select which event to listen to.

export function MyComponent(props) {
  return <motion.div onTap={props.onTap} style={{ width: 50, height: 50 }} />
}

addPropertyControls(MyComponent, {
  onTap: {
    type: ControlType.EventHandler,
  },
})
File ControlType.File
A control that allows the user to pick a file resource. It will be included in the component props as a URL string. Displayed as a file picker that will open a native file browser. The selected file will be provided as a fully qualified URL. The allowedFileTypes property must be provided to specify acceptable file types.

export function MyComponent(props) {
  return (
      <video
        style={{ objectFit: "contain", ...props.style }}
        src={props.filepath}
        controls
      />
  )
}

addPropertyControls(MyComponent, {
  filepath: {
    type: ControlType.File,
    allowedFileTypes: ["mov"],
  },
})
ResponsiveImage ControlType.ResponsiveImage
A control that allows the user to pick an image resource. Displayed as an image picker with associated file picker.

The chosen image will be provided in the component props as an object with src and srcSet properties:

src: a string containing the URL of a full resolution image

srcSet: an optional string with scaled down image variants. This is typically passed into <img srcSet /> and helps the browser to load a smaller image when a full-size one isn’t necessary.

alt: an optional description of the image.

Note: ControlType.Image is deprecated, please use ControlType.ResponsiveImage

export function MyComponent(props) {
  return (
      <img 
        src={props.image.src}
        srcSet={props.image.srcSet}
        alt={props.image.alt}
      />
  )
}
     
addPropertyControls(MyComponent, {
  image: {
    type: ControlType.ResponsiveImage,
  }
})
Number ControlType.Number
A control that accepts any numeric value. This will be provided directly as a property. Will display an input field with a range slider by default. The displayStepper option can be enabled to include a stepper control instead.

import { motion } from "framer-motion"

export function MyComponent(props) {
    return (
        <motion.div rotateZ={props.rotation} style={{ width: 50, height: 50 }}>
            {props.rotation}
        </motion.div>
    )
}

addPropertyControls(MyComponent, {
  rotation: {
    type: ControlType.Number,
    defaultValue: 0,
    min: 0,
    max: 360,
    unit: "deg",
    step: 0.1,
    displayStepper: true,
  },
})
Object ControlType.Object
A control that allows for grouping multiple properties as an object.

You can make the object removable by adding the optional property. To replace the default button title, use the buttonTitle property. To change the default icon, use the icon property.

export function MyComponent(props) {
  return (
    <div 
      style={{ 
        opacity: props.myObject.opacity,
        backgroundColor: props.myObject.tint
      }} 
    />
  )
}

addPropertyControls(MyComponent, {
  optional: true,
  buttonTitle: "Style",
  icon: "color", // boolean, object, color, effect or interact
  myObject: {
    type: ControlType.Object,
    controls: {
      opacity: { type: ControlType.Number },
      tint: { type: ControlType.Color },
    }
  }
})
String ControlType.String
A control that accepts plain text values. This will be provided directly as a property. Will display an input field with an optional placeholder value.

If obscured attribute is set to true a password input field will be used instead of a regular text input so that the value in the input will be visually obscured, yet still be available as plain text inside the component. displayTextArea can be enabled to display a multi-line input area instead. maxLength can be set to limit the maximum number of characters that can be entered in the input field.

export function MyComponent(props) {
  return <div>{props.title} — {props.body}</div>
}

addPropertyControls(MyComponent, {
  title: {
    type: ControlType.String,
    defaultValue: "Framer",
    placeholder: "Type something…",
    maxLength: 50
  },
  body: {
    type: ControlType.String,
    defaultValue: "Lorem ipsum dolor sit amet.",
    placeholder: "Type something…",
    displayTextArea: true,
  },
})
Transition ControlType.Transition
A control that allows for editing Framer Motion transition options within the Framer UI.

export function MyComponent(props) {
  return (
      <motion.div
         animate={{ scale: 2 }}
         transition={props.transition}
      />
  )
}

addPropertyControls(MyComponent, {
  transition: {
    type: ControlType.Transition,
    defaultValue: { type: "spring", stiffness: 800, damping: 60 },
  },
})
Link ControlType.Link
A control that allows for exposing web links.

export function MyComponent(props) {
  return <a href={props.link}>My Link</a>
}

addPropertyControls(MyComponent, {
  link: {
    type: ControlType.Link,
    defaultValue: "https://www.framer.com"
  }
})
Padding ControlType.Padding
A control that represents CSS padding. Will display an input field to accept a single value, alongside a segmented control allowing four distinct values to be provided.

Includes an optional defaultValue that can be set with single value (e.g. "10px" or "10px 20px 30px 40px").

Note: FusedNumber is deprecated, please use ControlType.Padding and ControlType.BorderRadius

export function MyComponent({ padding }) {
  return <div style={{ padding }} />
}
     
addPropertyControls(MyComponent, {
  padding: {
    type: ControlType.Padding,
    defaultValue: "8px",
  }
})
BorderRadius ControlType.BorderRadius
A control that represents CSS border radius. Will display an input field to accept a single value, alongside a segmented control allowing four distinct values to be provided.

Includes an optional defaultValue that can be set with single value (e.g. "10px" or "10px 20px 30px 40px").

Note: FusedNumber is deprecated, please use ControlType.Padding and ControlType.BorderRadius

export function MyComponent({ borderRadius }) {
  return <div style={{ borderRadius }} />
}
     
addPropertyControls(MyComponent, {
  borderRadius: {
    type: ControlType.BorderRadius,
    defaultValue: "16px",
    title: "Radius",
  }
})
Border ControlType.Border
A control that represents a border style. Either borderWidth or the equivalent per-side values (e.g borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth) will be provided.

export function MyComponent(props) {
  return <div style={props.border} />
}

addPropertyControls(MyComponent, {
  border: {
    type: ControlType.Border,
    defaultValue: {
      borderWidth: 1,
      borderStyle: "solid", // solid, dashed, dotted or double
      borderColor: "rgba(0, 0, 0, 0.5)",
    },
  }
})
You can also set the default value for each side.

export function MyComponent(props) {
  return <div style={props.border} />
}

addPropertyControls(MyComponent, {
  border: {
    type: ControlType.Border,
    defaultValue: {
      borderTopWidth: 2,
      borderRightWidth: 1,
      borderBottomWidth: 2,
      borderLeftWidth: 1,
      borderStyle: "solid", // solid, dashed, dotted or double
      borderColor: "rgba(0, 0, 0, 0.5)",
    },
  }
})
BoxShadow ControlType.BoxShadow
A control that allows for exposing shadows. The value will be provided as a string with valid CSS box-shadow values.

export function MyComponent(props) {
  return <motion.div style={{boxShadow: props.shadow}} />
}

addPropertyControls(MyComponent, {
  shadow: {
    type: ControlType.BoxShadow,
    defaultValue: "0px 1px 2px 0px rgba(0,0,0,0.25)",
  }
})

API Reference
A list of exports from the framer library available in every Code Component.

RenderTarget
To detect which context your Code Component is currently being shown, you can import and use RenderTarget. This includes RenderTarget.current() function to check the current RenderTarget as well as few types to check them against.

RenderTarget.canvas — The Canvas

RenderTarget.export — The Export Canvas

RenderTarget.thumbnail — Project Thumbnails

RenderTarget.preview — The Preview or live site

import { RenderTarget } from "framer"

const isOnCanvas = RenderTarget.current() === RenderTarget.canvas
Canvas and Export
For Components that animate, like WEBGL shaders, we have a custom hook that we recommend you use instead. This ensures that your Component is static both on the Canvas and the exported assets—preventing performance issues on the Canvas and exporting issues like tiling, which are issues caused by the Component still animating during export. For all animated components, instead of RenderTarget, use this hook.

import { useIsStaticRenderer } from "framer"

// Static on both Canvas and Export
const isStaticRenderer = useIsStaticRenderer()
Localization
When using Localization with Framer you may want to create a custom Locale Picker. In most cases you should do this with Smart Components, which you can learn about in the Localization 2.0 video. However if you have very specific needs based on logic there is an API for getting and setting the current Locale info.

useLocaleInfo()
const { activeLocale, locales, setLocale } = useLocaleInfo()

function handleChange(event) {
    const locale = locales.find((locale) => locale.id === localeId)
    setLocale(locale)
}

return (
  <select
    value={activeLocale?.id ?? "default"}
    onChange={handleChange}
  >
    {locales.map((locale) => (
      <option key={locale.id} value={locale.id}>
        {locale.name}
      </option>
    ))}
  </select>
)
Property Controls
Property Controls allow users to pass props to a Code Component through the Framer interface. There is only one function needed for this feature, however the full type reference can be found in our Property Controls Guide.

addPropertyControls(component, controls)
import { addPropertyControls, ControlType } from "framer"

function Button(props) {
  const { tint = "#09F" } = props

  return <button style={{ background: tint }}>Hello</button>
}

addPropertyControls(Button, {
  tint: {
    type: ControlType.Color
  }
})
Framer Motion
Also available in every Code Component is the entire Motion for React API. This can be imported from "framer-motion".

import { animate, motion } from "framer-motion"