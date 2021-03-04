function Validator(infor) {

    var formElement = document.querySelector(infor.form);
    //Object chua tat ca function check
    var rulesChecker = {};
    
    //Lay ra element cha chua the input(chua ca the message) trong truong hop the input duoc boc trong nhieu the khac
    function getParent(inputElement, parentSelector) {
        var parent = inputElement.parentElement;
        while(parent) {
            // The matches() method returns a Boolean value indicating whether an element is matched by a specific CSS selector or not
            if(parent.matches(parentSelector)) {
                return parent;
            }
            parent = parent.parentElement;
        }
    }

    function validate(inputElement, selector) {
        var formGroupElement = getParent(inputElement, infor.formGroup);

        //Lay message element tu form group chua message element
        var messageElement = formGroupElement.querySelector(infor.messageSelector);
        var message;
        var rules = rulesChecker[selector];

        for(var i = 0; i < rules.length; i++) {
            //radio hoac checkbox neu lay value thi se lay ra value cua o checkbox
            // -> Luon co gia tri cua value truyen vao ham check -> khong bi loi ke ca nguoi dung khong tich o nao
            switch(inputElement.type) {
                case "radio":
                case "checkbox":
                    message = rules[i](formGroupElement.querySelector(selector + ":checked") ? "checked" : "");
                    break;
                default:
                    message = rules[i](inputElement.value);
            }
            
            if(message) break;
        }

        if(message) {
            messageElement.innerText = message;
            //Them class invalid neu gia tri nguoi dung nhap khong thoa man dieu kien
            formGroupElement.classList.add("invalid");
        }
        else {
            messageElement.innerText = "";
            //Bo class invalid
            formGroupElement.classList.remove("invalid");
        }

        //Chuyen message sang boolean roi tra ve -> Co message(Co loi) tra ve false
        return !message;
    }

    //Neu co ton tai form trong DOM thi moi bat su kien va kiem tra
    if(formElement) {
        formElement.onsubmit = function(e) {
            //Ngan chan hanh dong mac dinh gui form den may chu
            e.preventDefault();

            var isValid = true;

            infor.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                if(!validate(inputElement, rule.selector)) {
                    isValid = false;
                }
            })

            if(isValid) {
                //Thuc hien submit voi javascript
                if(typeof infor.submitting === "function") {
                    //Lay ra tat ca cac element duoc gui di(co name), co the tuong tac(khong phai disabled)
                    var enableInputElements = formElement.querySelectorAll("[name]:not([disabled])");
    
                    //Chuyen Node list sang array roi lay ra cac gia tri cua element
                    var enableInputs = Array.from(enableInputElements).reduce(function(allInput, currentInputElement) {

                        switch(currentInputElement.type) {
                            case "radio":
                                //khi nguoi dung khong check o nao thi submit van tra lai chuoi rong
                                if(!allInput[currentInputElement.name]) {
                                    allInput[currentInputElement.name] = "";
                                }

                                //o nao checked moi gan
                                if(currentInputElement.checked) {
                                    allInput[currentInputElement.name] = currentInputElement.value;
                                }
                                break;
                            case "checkbox":
                                if(!currentInputElement.checked) {
                                    return allInput;
                                }
                                if(!Array.isArray(allInput[currentInputElement.name])) {
                                    allInput[currentInputElement.name] = [];
                                }

                                allInput[currentInputElement.name].push(currentInputElement.value);

                                break;
                            case "file":
                                allInput[currentInputElement.name] = currentInputElement.files;
                                break;
                            default:
                                allInput[currentInputElement.name] = currentInputElement.value;
                        }
                        
                        return allInput;
                    }, {});
    
                    infor.submitting(enableInputs);
                }
                //submit voi hanh vi mac dinh cua HTML
                else {
                    formElement.submit();
                }
            }
        }

        infor.rules.forEach(function(rule) {
            // Lay ra tat ca function check thuoc ve 1 input can validate va luu vao mang 
            // -> Luu vao object rulesChecker voi key la selector cua element
            if(Array.isArray(rulesChecker[rule.selector])) {
                rulesChecker[rule.selector].push(rule.check);
            }
            else {
                rulesChecker[rule.selector] = [rule.check];
            }
    
            //Lay input element tu form element yeu cau validate
            var inputElements = formElement.querySelectorAll(rule.selector);

            //Co input element thi moi bat su kien
            for(var inputElement of inputElements) {

                var formGroupElement = getParent(inputElement, infor.formGroup);
    
                //Lay message element tu form group chua message element
                var messageElement = formGroupElement.querySelector(infor.messageSelector);

                inputElement.onblur = function() {
                    validate(inputElement, rule.selector);
                }
    
                inputElement.oninput = function() {
                    messageElement.innerText = "";
                    //Bo class invalid
                    formGroupElement.classList.remove("invalid");
                }
            }
        });
    }
}

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        //value - gia tri nguoi dung nhap vao/chon
        check: function(value) {
            //su dung trim() -> kiem tra truong hop nguoi dung nhap toan khoang trang
            return value.trim() ? undefined : message || "Vui long nhap truong nay";
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        check: function(value) {
            var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(value) ? undefined : message || "Nhap khong chinh xac";
        }
    };
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        check: function(value) {
            return value.length >= min ? undefined : message || `Vui long nhap toi thieu ${min} ky tu`;
        }
    }
}

Validator.isMatched = function(selector, inputElement, message) {
    return {
        selector: selector,
        check: function(value) {
            return value === inputElement().value ? undefined : message || "Nhap khong chinh xac";
        }
    }
}