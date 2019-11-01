var request = "";

const fs = require('fs')

const socket = io.connect('http://localhost:4444')

$(document).ready(function(){

    fs.readFile(`./biometria.html`, (err, data) => {
        document.getElementById('content').innerHTML = data
    })

    
    socket.on('identify', response => {

        if(response.type == 'error'){
            $("#funcionario").html(response.data)
        }
        else{
            $("#funcionario").html(`<div class='mb-2'>${response.data.nome}</div><div class='mb-2'>${response.data.data.horario}</div><div class='mb-2'>${response.data.data.mensagem}</div>`)
        }
        socket.emit('identify', null)
    })
    
    socket.emit('identify', null)

    socket.on('users', response => {
        var tabela = $("#funcionarios-table")
        tabela.find("tbody").find("tr").remove()
        tabela.find("tfoot").find("tr").remove()

        if(response.type == 'error'){
            tabela.find('tbody').append(
                "<tr><td colspan='100%'>"+response.data+"</td></tr>"
            )
        }else{
            response.data.data.map((val) => {
    
                tabela.find("tbody").append(
                    "<tr>"+
                        `<td>${val.nome}</td>`+
                        `<td>${val.biometria ? "Sim" : "Não"}</td>`+
                        `<td><button data-id=${val.id} class="btn btn-secondary biometria">Biometria</button></td>`+
                    "</tr>"
                )
            })
            var html = "<tr><td colspan='100%'><ul class='pagination text-center' role=navigation'>"
                
            html += `<li class='page-item ${response.data.current_page == 1 ? 'disabled' : ''}'> <button type="button" class='page-link' data-page=${response.data.current_page == 1 ? 0 : response.data.current_page-1}><</button></li>`
    
            for(var i=1; i <= response.data.last_page;i++){
                html += `<li class='page-item ${response.data.current_page == i ? 'active' : ''}'> <button type="button" data-page=${response.data.current_page == i ? 0 : i} class='page-link'>${i}</button></li>`
            }
    
            html += `<li class='page-item ${response.data.current_page == response.data.last_page ? 'disabled' : ''}'><button type="button" class='page-link' data-page=${response.data.current_page == response.data.last_page ? 0 : response.data.current_page+1}>></button></li>`
    
            html += "</ul></td></tr>"
    
            tabela.find("tfoot").append(html)
        }
    })

    socket.on('addBiometry', response => {
        var modal = $("#modal-digital")
        if(response.type == 'success'){
            modal.find(".modal-body").html("Digital cadastrada com sucesso")
        }else{
            modal.find(".modal-body").html("Erro no cadastro de digital, feche e tente novamente")
        }
    })

    socket.on('biometryCheck', response => {
        $(".biometric-img-"+($('.greenBorder').length + 1)).addClass('greenBorder')    
    })

})

$(document).on('click','#funcionarios',function(){

    fs.readFile('./funcionarios.html', (err, data) => {
        document.getElementById('content').innerHTML = data
    })

    socket.emit('users', 0)
})

$(document).on('click','#voltar',function(){
    fs.readFile(`./biometria.html`, (err, data) => {
        document.getElementById('content').innerHTML = data
    })
    
    socket.emit('identify', null)
})


$(document).on('click','.page-link', function(){
    if($(this).data('page') != 0)
        socket.emit('users', $(this).data('page'))
})

$(document).on('click','.close-modal', function(){
    socket.emit('users', 0)
})

$(document).on('click','.biometria',function(){
    var modal = $("#modal-digital")
    modal.find(".modal-body").html("<h5 class='text-center'> Insira sua digital 5 vezes para que seja gravado no sistema</h5><br><div class='row mt-3'><div class='col'><img class='img-fluid biometric-img-1' src='./assets/scanning.png'></div><div class='col'><img class='img-fluid biometric-img-2' src='./assets/scanning.png'></div><div class='col'><img class='img-fluid biometric-img-3' src='./assets/scanning.png'></div><div class='col'><img class='img-fluid biometric-img-4' src='./assets/scanning.png'></div><div class='col'><img class='img-fluid biometric-img-5' src='./assets/scanning.png'></div></div>");
    modal.modal({backdrop: 'static', keyboard: false})
    socket.emit('addBiometry', $(this).data('id'))
})
