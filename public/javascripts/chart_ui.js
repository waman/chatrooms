function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}

function divSystemContentElement(message){
    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket){
    let message = $('#send-message').val();
    let systemMessage;

    if(message.charAt(0) == '/'){
        systemMessage = chartApp.processCommand(message);
        if(systemMessage){
            $('#message').append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($('#room').text(), message);
        $('#message').append(divEscapedContentElement(message));
        $('#message').scrollTop($('#message').prop('scrollHeight'));
    }

    $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function(){
    let chatApp = new Chat(socket);

    socket.on('nameResult', function(result){
        let message;

        if(result.success){
            message = 'You are now known as ' + result.name + '.';
        }else{
            message = result.message;
        }
        $('#message').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result){
        $('#room').text(result.room);
        $('#message').append(divSystemContentElement('Room changed.'));
    });

    socket.on('rooms', function(rooms){
        $('#room-list').empty();
        for(let room in rooms){
            room = room.substring(1, room.length);
            if(room != ''){
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        $('#send-list div').click(function(){
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });

    setInterval(() => socket.emit('rooms'), 1000);

    $('#send-message').focus();

    $('#send-form').submit(() => {
        processUserInput(chatApp, socket);
        return false;
    });;
});