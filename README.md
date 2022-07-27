# Html-containers

*Html containers specification and examples*.

## Quick start

- fetch repository files
- copy one of examples from src folder, e.g.
  `cp ./src/sunset ./custom/sunset-custom`
- modify html/css/js as you want (*don't rename or remove **`LSContainer`** methods*)
- make sure you don't remove **index.html** or **script.js**
- open `./custom/sunset-custom/test-vertical.html` in browser
- validate/preview your container during development
- Archive container as `zip` when ready. Please make it from container root level:
  ```
  cd ./custom; 
  zip -e container ./sunset-custom/*;
  ```

- Your container  is ready to use, publish/share result zip archive

## Demo

[weather](https://codepen.io/gandboy91/full/RwQEgVz)  
[clock](https://codepen.io/gandboy91/full/KKomxzX)  
[sunrise/sunset](https://codepen.io/gandboy91/full/RwMGKbr)   
[water temperature](https://codepen.io/gandboy91/full/ZExyWPG)

\* *Black cityscreen is added for better look/feel impression*  
\** *Livesystems logo is just a placeholder*

## Features and capability

#### Dynamic Data
Any dynamic data can be passed to container to display it or use in calculations with JavaScript later.    
Some possible examples:   
* current time 
* weather / water temperature / sunset time specific to current region
* currency rates / financial data (stock indexes, etc..)
* news
* Interesting facts about current city region
* Specific to place data, for example number of refueled cars on gas station

#### HTML5
Promo movie is a plain HTML markup, meaning it's
* 1 container - 1 template and not limited dynamic content
* highly customizable
* easy to maintain

#### CSS3 / Animations
Promo can contain CSS3 styles which gives such advantages as:
* easy to adjust by web-designers with company brand style concepts
* As easy to reuse as copy / paste `.css` file
* CSS3 Animations and Transitions can be used to create nice data appearance
* much less size in comparison with photo / video assets 

#### JS 
Promo can be powered with JavaScript which allows:
* do light real time calculations
* manage animations and transitions
* display and control dynamic data provided for container

## Specification

Result file should be archived as a `.zip`

**Obligatory files**:
- index.html with script file included (`script.js` in examples)
- `script.js` with **musthave** functionality (LsContainer) which is included in index.html

**JS requirements**:  
> :warning: **All listed requirements are already implemented in `LsContainer` class**   
> which you'll find in examples. It's recommended to not overwrite existing methods.     
> It's ok however to create new methods and change `play` / `setup` methods implementation.

- script should listen for `'setup'` and `'play'` Events
- script should emit `'ptvready'` and `'playStarted'` Event
- script should respect machine resources:   
  shouldn't block or overload thread (next movie may not be started)

**Container Lifecycle**

1. Container's injected via iframe
2. `'DOMContentLoaded'` event on `document` when DOM is ready
3. `'load'` event on `window` when page with all resources is loaded
4. Init step: register listeners for `'setup'`, `'play'` and `'test'` Events, LSContainer instantiated
5. `'setup'` event on `document` object from controlling script (signal to prepare)
6. Setup step: receiving variables, pre-calculations, etc..
7. `'ptvready'` Event should be dispatched from script when setup is completed
8. `'play'` event on `document` object from controlling script (signal to play)
9. Visible part of promo starts here
10. `'playStarted'` Event should be dispatched as soon as when play functionality is executed
11. Promo plays until controlling script launches next container

**Limitations**
- No ajax calls or any requests to non-local resources (cdn, web api, etc..).   
All data should be provided as dynamic variables and should be read in `setup` step  
- Images should be placed as files on root level or be encoded as base64 strings
- Some CSS functions or JS Browser API may be not supported.   
Please make sure that wanted features are supported in webkit browsers (for example Safari).   
check https://caniuse.com/

## Dynamic Variables

Variables are passed via `CustomEvent` of type `'setup'` and can be retrieved from `event.detail`.     
We can for example iterate over variables and log them.
```js
document.addEventListener('setup', function(event) {
  Object.entries(event.detail).forEach(
    ([key, value]) => console.info(key, ':', value)
  );
});
```

## Tips and known issues

### Development & Validation

For development process please use `test-vertical.html` included in each example.   
There you can open container in 9:16 viewport to check hot it looks like on vertical screen.       
Just open `test-vertical.html` file with a browser and press `play`.    
You'll find there also validate function to check if container is working properly.
> TIP: To be sure that you use compatible with webKit CSS / JS features, run it with Safari browser

### Performance

* Make sure that you unsubscribe all listeners and clean all intervals / timeouts by the end of script.
* Try to avoid `infinite` transitions and prefer `setTimeout` over `setInterval`
* Don't overload JS thread. F-12 is powerful enough but remember that JS is single-threaded.
* Use CSS animations to delegate some load to GPU and free CPU resources. (prefer CSS over requestAnimationFrame when possible)
* In case of really intense CSS transformations using 3d may do a trick with performance. Modern browsers enable hardware acceleration seeing 3D in css. So fake 3d transformations like `translate3d(0,0,0)` or `translateZ(0)` may help a lot.
* Don't overuse shadows and gradients, especially on background or moving elements. It affects performance dramatically.    
