function watchFps() {
    const container = document.createElement('div');
    container.innerHTML = '<div class="fps-meter">fps: <span id="fps"></span></div>';
    const containerStyle = document.createElement('style');
    containerStyle.innerHTML = `
      .fps-meter {
        position: absolute;
        left: 20px;
        bottom: 20px;
        color: white;
      }
      .fps-meter #fps {
        margin-left: 5px;
        padding: 5px;
      }
    `;
    containerStyle.nonce = btoa('livesystems');
    document.head.appendChild(containerStyle);
    document.body.appendChild(container);

    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.ieRequestAnimationFrame     ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    const fpsElement = document.getElementById('fps');

    let then = Date.now() / 1000;  // time in seconds

    function render() {
        const now = Date.now() / 1000;  // time in seconds
        // compute time since last frame
        const executionTime = now - then;
        then = now;
        const fps = 1 / executionTime;
        let color = 'green';
        if (fps < 60) {
            color = '#8AAF1C';
        }
        if (fps < 40) {
            color = '#AFA31C';
        }
        if (fps < 30) {
            color = '#AF801C';
        }
        if (fps < 25) {
            color = '#942F18';
        }
        fpsElement.innerText = fps.toFixed(2);
        fpsElement.style.backgroundColor = color;
        requestAnimFrame(render);
    };
    render();
}

window.watchFps = watchFps;