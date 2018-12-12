let initSnippets = require('./init_snippets.js');
require('./code_test.js');
const apiVariables = require('./api_variables');
const errHandler = require('./err_handler');
const CodeMirror = require('codemirror/lib/codemirror.js');
require("codemirror/mode/javascript/javascript.js");
require("codemirror/addon/edit/matchbrackets.js");
require("codemirror/keymap/vim.js");
require("codemirror/keymap/emacs.js");
require("codemirror/addon/selection/active-line.js");

function updateVariableValues() {
  return apiVariables.map(variable => {
    try {
      let varDivId = `${variable}Var`;
      if(window[variable] && window[variable].constructor !== HTMLDivElement) {
        if(document.getElementById('tempText')) {
          let tempText = document.getElementById('tempText');
          tempText.parentNode.removeChild(tempText);
        }
        let varBoxEl = document.getElementById('variables');
        if(document.getElementById(varDivId)) {
          let pEl = document.getElementById(varDivId);
          let currentTextContent = pEl.textContent;

          pEl.textContent = '';
          let spanEl = document.createElement('span');
          spanEl.setAttribute('class', 'varName');
          spanEl.textContent = variable + ': ';
          pEl.appendChild(spanEl);

          let textNodeEl = document.createTextNode(window[variable]);

          pEl.appendChild(textNodeEl);

          let regexObject = new RegExp(window[variable]);

          if(!(regexObject.test(currentTextContent))) {
              pEl.setAttribute('class', 'flash');
          }

          varBoxEl.appendChild(pEl);
        } else {
          let pEl = document.createElement('p');
          pEl.setAttribute('id', varDivId);
          pEl.setAttribute('class', 'varValue');
          let spanEl = document.createElement('span');
          spanEl.setAttribute('class', 'varName');
          spanEl.textContent = variable + ': ';
          pEl.appendChild(spanEl);

          let textNodeEl = document.createTextNode(window[variable]);

          pEl.appendChild(textNodeEl);
          pEl.setAttribute('class', 'flash');
          varBoxEl.appendChild(pEl);
        }
      } else {
        let targetEl = document.getElementById(varDivId);
        if (targetEl) {
          targetEl.parentNode.removeChild(targetEl);
        }

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


function evalSnippet(string) {
  return Function(`return ${string};`)();
}

function handleSubmit() {
  if(document.getElementById('loader')) {
    document.getElementById('loader').parentNode.removeChild(document.getElementById('loader'));
  }
  let loader = document.createElement('div');
  loader.setAttribute('id', 'loader');
  document.getElementById('rightside').appendChild(loader);

  try {
    const res = evalSnippet(editor.getValue());
    return res().then(res => {
      loader.parentNode.removeChild(loader);

      updateVariableValues();

      if(/ReferenceError/.test(res)) {
      	return errHandler.handleReferenceError(res);	
      } else if(/Setup Incomplete/.test(res)) {
        return errHandler.handleIncompleteSetup();
      } else if (/experimental/.test(res)) {
        return errHandler.handleExperimentalApi();
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

    });
  } catch (e) {
    console.log('Unhandled error: ', e);
    loader.parentNode.removeChild(loader);
  }
}

const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        lineNumbers:true,
        mode: 'javascript',
	matchBrackets: true,
	tabSize: 2,
	styleActiveLine: true,
	viewportMargin: Infinity 
});

const toggleVim = () => {
  if(editor.options.keyMap === 'default' || editor.options.keyMap === 'emacs') {
    const emacs = document.getElementById('emacs');
    emacs.checked = false;
    editor.setOption('keyMap', 'vim');
  } else {
    editor.setOption('keyMap', 'default');
  }
  editor.focus();
};

const toggleEmacs = () => {
  if(editor.options.keyMap === 'default' || editor.options.keyMap === 'vim') {
    const vim = document.getElementById('vim');
    vim.checked = false;
    editor.setOption('keyMap', 'emacs');
  } else {
    editor.setOption('keyMap', 'default');
  }
  editor.focus();
};

const inputs = document.getElementsByTagName('input');
Array.prototype.forEach.call(inputs, (input) => {input.checked = false});
window.toggleVim = toggleVim;
window.toggleEmacs = toggleEmacs;
window.editor = editor;
window.handleSubmit = handleSubmit;

document.addEventListener('keyup', function(e) {
  const textAreaFocused = editor.hasFocus();
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

module.exports = {};
