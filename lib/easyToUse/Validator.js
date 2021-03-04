function Validator(formSelector) {
    var formElement = document.querySelector(formSelector);
    
    var validateFunctions = {
        required: function(value) {
            return value.trim() ? undefined : "Vui long nhap truong nay";
        },
        email: function(value) {
            var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(value) ? undefined : "Vui long nhap email chinh xac";
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ky tu`;
            }
        }
    }

    //Chua cac function validate can thiet cho tung the input
    var formRuleCheckers = {};

    if(formElement) {
        var inputElements = formElement.querySelectorAll("[name][rules]");

        for(inputElement of inputElements) {
            var rules = inputElement.getAttribute("rules").split("|");

            for(var rule of rules) {
                if(!Array.isArray(formRuleCheckers[inputElement.name])) {
                    formRuleCheckers[inputElement.name] = []
                }

                var ruleChecker = validateFunctions[rule];

                if(rule.includes(":")) {
                    var ruleInfo = rule.split(":");
                    ruleChecker = validateFunctions[ruleInfo[0]](Number(ruleInfo[1]));
                }

                formRuleCheckers[inputElement.name].push(ruleChecker);
            }

            inputElement.onblur = handleValidate;
            inputElement.oninput = handleClearError;
        }

        //Lay ra doi tuong validator da khoi tao
        //Neu dung this trong formElement.onsubmit = function(event){} thi this se la formElement
        var _this = this;

        formElement.onsubmit = function(event) {
            event.preventDefault();

            var isValid = true;

            for(var inputElement of inputElements) {
                if(!handleValidate({target: inputElement})) {
                    isValid = false;
                }
            }

            if(isValid) {
                if(_this.onSubmit) {
                    _this.onSubmit();
                }
                else {
                    formElement.submit();
                }
                    
            }
        }

        function handleValidate(event) {
            //event.target -> Lay ra element gay ra event
            //event.target.name -> Lay ra name cua element
            var ruleCheckers = formRuleCheckers[event.target.name];
            var message;

            for(ruleChecker of ruleCheckers) {
                message = ruleChecker(event.target.value);
                if(message) break;
            }

            var formGroupElement = event.target.parentElement;
            if(message) {
                if(formGroupElement) {
                    formGroupElement.classList.add("invalid");
                    var messageElement = formGroupElement.querySelector(".form-message");
                    if(messageElement) {
                        messageElement.innerText = message;
                    }
                }
            }

            return !message;
        }

        function handleClearError(event) {
            var formGroupElement = event.target.parentElement;
            if(formGroupElement) {
                if(formGroupElement.classList.contains("invalid")) {
                    formGroupElement.classList.remove("invalid");
                    var messageElement = formGroupElement.querySelector(".form-message");
                    if(messageElement) {
                        messageElement.innerText = "";
                    }
                }
            }
        }
    }
}