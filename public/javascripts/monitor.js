$(document).ready(function () {
    $("#toggleMonitor").click(function () {
//        alert("Blah");
        $("#monitorForm").toggle("slow", function () {
            // Animation complete.
        });
    });

    $(".delete").click(function () {
        confirm("Delete");
        $.ajax({
            url: "api/12345",  //TODO add correct ID
            context: document.body,
            type: "DELETE"
        }).done(function() {
            $( this ).addClass( "done" );  //TODO remove div with ID.  Removes deleted monitor.
        });
    });
});

