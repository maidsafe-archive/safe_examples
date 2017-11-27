let initSnippets = require('./init_snippets.js');
require('./code_test.js');
const apiVariables = require('./api_variables');
const errHandler = require('./err_handler');

function updateVariableValues() {
  return apiVariables.map(variable => {
    try {
      if(eval(variable)) {
        if(document.getElementById('tempText')) {
          let tempText = document.getElementById('tempText');
          tempText.parentNode.removeChild(tempText);
        }

        let varBoxEl = document.getElementById('variables');
        if(document.getElementById(variable)) {
          let pEl = document.getElementById(variable);
          let currentTextContent = pEl.textContent;

          pEl.textContent = '';
          let spanEl = document.createElement('span');
          spanEl.setAttribute('class', 'varName');
          spanEl.textContent = variable + ': ';
          pEl.appendChild(spanEl);

          let textNodeEl = document.createTextNode(eval(variable));

          pEl.appendChild(textNodeEl);

          let regexObject = new RegExp(eval(variable));

          if(!(regexObject.test(currentTextContent))) {
              pEl.setAttribute('class', 'flash');
          }

          varBoxEl.appendChild(pEl);
        } else {
          let pEl = document.createElement('p');
          pEl.setAttribute('id', variable);
          pEl.setAttribute('class', 'varValue');
          let spanEl = document.createElement('span');
          spanEl.setAttribute('class', 'varName');
          spanEl.textContent = variable + ': ';
          pEl.appendChild(spanEl);

          let textNodeEl = document.createTextNode(eval(variable));

          pEl.appendChild(textNodeEl);
          pEl.setAttribute('class', 'flash');
          varBoxEl.appendChild(pEl);
        }
      } else {
        let targetEl = document.getElementById(variable);
        targetEl.parentNode.removeChild(targetEl);

        let varBox = document.getElementById('variables');

        if(varBox.children.length == 1) {
          let italicEl = document.createElement('i');
          italicEl.textContent = 'No variables saved yet.';
          let pEl = document.createElement('p');
          pEl.setAttribute('id', 'tempText');
          pEl.appendChild(italicEl);
          varBox.appendChild(pEl);
        }
      }
    } catch (e) {
      return;
    }
  });
}

function handleSubmit() {
  if(document.getElementById('loader')) {
    document.getElementById('loader').parentNode.removeChild(document.getElementById('loader'));
  }
  let loader = document.createElement('div');
  loader.setAttribute('id', 'loader');
  document.getElementById('rightside').appendChild(loader);

  let el = document.getElementById('code');
  try {
    let res = eval(el.value);
    let isFreeSyncFunction = new RegExp('free').test(el.value);
    if(isFreeSyncFunction) {
      loader.parentNode.removeChild(loader);
      res();
      updateVariableValues();
      return;
    }
    return res().then(res => {
      console.log(res);
      loader.parentNode.removeChild(loader);

      updateVariableValues();

      if(/ReferenceError/.test(res)) {
      	return errHandler.handleReferenceError(res);	
      } else if(/Setup Incomplete/.test(res)) {
        return errHandler.handleIncompleteSetup();
      } else {
        let div = document.createElement('div');
        div.setAttribute("class", "box output");
        let pEl = document.createElement('p');
        pEl.textContent = res;
        div.appendChild(pEl);

        let parentEl = document.getElementById('codebox');
        if(parentEl.children.length == 1) {
          parentEl.appendChild(div);
        } else {
          let parentChildren = parentEl.children;
          parentEl.insertBefore(div, parentChildren[1]);
        }
      }

    })
  } catch (e) {
    console.log('Unhandled error: ', e);
  }
}


window.handleSubmit = handleSubmit;

document.addEventListener('keyup', function(e) {
  let textAreaFocused = document.activeElement == document.getElementById('code');
  if(e.keyCode == 13 && !textAreaFocused) {
    handleSubmit();
  }
})

document.addEventListener('animationend', function(e) {
  let parentElement = document.getElementById('variables');
  Array.prototype.map.call(parentElement.children, function(elem) {
  	elem.removeAttribute('class');
  })
})

document.addEventListener('input', function(e) {
  e.target.style.height = '0px';
  e.target.style.height = e.target.scrollHeight + 'px';
});

module.exports = {};
