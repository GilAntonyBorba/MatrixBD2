document.addEventListener('DOMContentLoaded', () => {
    document.forms.SignUp.onsubmit = validaForm;
});

function validaForm(e){
    let form = e.target;//target é o formulário que gerou essa submissão
    let formValido = true;
    console.log("início da função validaForm!");
    const spanLogin = form.InputLogin.nextElementSibling;//pega do name do input
    const spanPassword = form.InputPassword.nextElementSibling;

    spanLogin.textContent = "";//para não manter as mensagens de erro mesmoq ue eelas estejam certas (quando vc submeter o formulário de novo)
    spanPassword.textContent = "";

    if (form.InputLogin.value === "") {
        spanLogin.textContent = 'Usuário deve ser preenchido com o nome do usuário do sistema';
        formValido = false;
        form.InputLogin.classList.add("inputDestacado");
    }
    else{
        form.InputLogin.classList.remove("inputDestacado");
    }

    
    // Senha-=-=-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=--=-=
    if(form.InputPassword.value === ""){
        spanPassword.textContent = 'Uma senha deve ser fornecida';
        formValido = false;
        form.InputPassword.classList.add("inputDestacado");
    }else if(form.InputPassword.value.indexOf(' ')>=0){
        spanPassword.textContent = 'A senha não deve ter espaços em branco';
        formValido = false;
        form.InputPassword.classList.add("inputDestacado");
    }else if(form.InputPassword.value.length < 8){
        spanPassword.textContent = 'A senha deve conter pelo menos 8 caracteres';
        formValido = false;
        form.InputPassword.classList.add("inputDestacado");
    }else{
        form.InputPassword.classList.remove("inputDestacado");
    }

    if (!formValido){
        e.preventDefault();
    }
}