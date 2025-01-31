$.ajaxSetup({ cache: false })
$(document).ready(
        function() {
            $("#ProviderID").change(
            function() {
                $.ajax({ type: "get",
                    contentType: "application/json; charset=utf-8",
                    url: "GetClassrooms/" + $('#ProviderID').val(),
                    data: "{}",
                    dataType: "json",
                    success: function(data) {
                    var dropdownList = $("#ClassroomID") //Id of the dropdown               
                            $.each(data, function(index, optionData) {
                                            var optionItem = new optionData(optionData.Text,optionData.Value);
                                            dropdownList.add(optoinItem);
                                        }
         
                        $('#ClassroomID').empty(); // Remove Classrooms
                        if (data.length > 0) {
                            $('#ClassroomID').append(data);
                        } //data.length >0
                    } //success
                }); //$.ajax      
            } //function
        ); //change
        },
        function() {
            $("#SchoolID").change(
            function() {
                $.ajax({ type: "get",
                    contentType: "application/json; charset=utf-8",
                    url: "GetSchoolTracks/" + $('#SchoolID').val(),
                    data: "{}",
                    dataType: "json",
                    success: function(data) {
                        $('#SchoolTrackID').empty(); // Remove School Tracks
                        if (data.length > 0) {
                            $('#SchoolTrackID').append(data);
                        } //data.length >0
                    } //success
                }); //$.ajax      
            } //function
        ); //change
        }


);  //$(function(),(document.ready...)
