$(document).ready(function() {
    let blocks = [];
    let departments = [];
    let groupDepartments = [];
    let periodOptions = [];

    // Initialize the application
    initializeApp();

    function initializeApp() {
        loadBlocks();
        loadDepartments();
        loadGroupDepartments();
        setupPeriodOptions();
        setupEventHandlers();
        initializeDatePickers();
    }

    function loadBlocks() {
        $.ajax({
            url: '/api/schedule/proxy',
            method: 'GET',
            data: {
                q: 'req_type=obj_list&req_mode=room&show_ID=yes&req_format=json&coding_mode=UTF8&bs=ok'
            },
            success: function(data) {
                console.log('Blocks API response:', data);
                
                // Check for API errors in response body
                if (data.psrozklad_export && data.psrozklad_export.error) {
                    const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                    const errorCode = data.psrozklad_export.error.errorcode || '';
                    showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                    return;
                }
                
                // Parse the raw JSON response from external API
                if (data.psrozklad_export && data.psrozklad_export.blocks) {
                    blocks = data.psrozklad_export.blocks.filter(b => b.objects && b.objects.length > 0);
                    populateBlocks();
                } else {
                    showError('Неправильна структура відповіді API: ' + JSON.stringify(data));
                }
            },
            error: function(xhr, status, error) {
                console.error('Blocks API error:', {xhr, status, error});
                const errorDetails = getDetailedErrorMessage(xhr);
                showError('Помилка завантаження корпусів: ' + errorDetails);
            }
        });
    }

    function loadDepartments() {
        $.ajax({
            url: '/api/schedule/proxy',
            method: 'GET',
            data: {
                q: 'req_type=obj_list&req_mode=teacher&show_ID=yes&req_format=json&coding_mode=UTF8&bs=ok'
            },
            success: function(data) {
                console.log('Departments API response:', data);
                
                // Check for API errors in response body
                if (data.psrozklad_export && data.psrozklad_export.error) {
                    const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                    const errorCode = data.psrozklad_export.error.errorcode || '';
                    showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                    return;
                }
                
                // Parse the raw JSON response from external API
                if (data.psrozklad_export && data.psrozklad_export.departments) {
                    departments = data.psrozklad_export.departments.filter(d => d.objects && d.objects.length > 0);
                    populateDepartments();
                } else {
                    showError('Неправильна структура відповіді API: ' + JSON.stringify(data));
                }
            },
            error: function(xhr, status, error) {
                console.error('Departments API error:', {xhr, status, error});
                const errorDetails = getDetailedErrorMessage(xhr);
                showError('Помилка завантаження підрозділів: ' + errorDetails);
            }
        });
    }

    function loadGroupDepartments() {
        $.ajax({
            url: '/api/schedule/proxy',
            method: 'GET',
            data: {
                q: 'req_type=obj_list&req_mode=group&show_ID=yes&req_format=json&coding_mode=UTF8&bs=ok'
            },
            success: function(data) {
                console.log('Group Departments API response:', data);
                
                // Check for API errors in response body
                if (data.psrozklad_export && data.psrozklad_export.error) {
                    const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                    const errorCode = data.psrozklad_export.error.errorcode || '';
                    showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                    return;
                }
                
                // Parse the raw JSON response from external API
                if (data.psrozklad_export && data.psrozklad_export.departments) {
                    groupDepartments = data.psrozklad_export.departments.filter(d => d.objects && d.objects.length > 0);
                    populateGroupDepartments();
                } else {
                    showError('Неправильна структура відповіді API: ' + JSON.stringify(data));
                }
            },
            error: function(xhr, status, error) {
                console.error('Group Departments API error:', {xhr, status, error});
                const errorDetails = getDetailedErrorMessage(xhr);
                showError('Помилка завантаження груп: ' + errorDetails);
            }
        });
    }

    function setupPeriodOptions() {
        const today = new Date();
        const currentWeekStart = getWeekStart(today);
        const currentWeekEnd = getWeekEnd(today);
        
        // Fix current month calculation - ensure we get the correct month
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
        
        // Fix previous month calculation
        const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const previousMonthEnd = new Date(currentYear, currentMonth, 0);
        
        const currentTerm = getCurrentTerm(today);
        
        periodOptions = [
            {
                value: 'to_end_of_week',
                label: 'До кінця тижня',
                fromDate: formatDateForAPI(today),
                toDate: formatDateForAPI(currentWeekEnd)
            },
            {
                value: 'current_week',
                label: 'Поточний тиждень',
                fromDate: formatDateForAPI(currentWeekStart),
                toDate: formatDateForAPI(currentWeekEnd)
            },
            {
                value: 'current_month',
                label: 'Поточний місяць',
                fromDate: formatDateForAPI(currentMonthStart),
                toDate: formatDateForAPI(currentMonthEnd)
            },
            {
                value: 'previous_month',
                label: 'Попередній місяць',
                fromDate: formatDateForAPI(previousMonthStart),
                toDate: formatDateForAPI(previousMonthEnd)
            },
            {
                value: 'current_term',
                label: 'Поточний семестр',
                fromDate: formatDateForAPI(currentTerm.start),
                toDate: formatDateForAPI(currentTerm.end)
            },
            {
                value: 'custom',
                label: 'Власний період',
                fromDate: formatDateForAPI(today),
                toDate: formatDateForAPI(today)
            }
        ];
        
        populatePeriodOptions();
    }

    function populateBlocks() {
        const $blockSelect = $('#selectedBlock');
        $blockSelect.empty();
        $blockSelect.append('<option value="">Оберіть корпус</option>');
        
        blocks.forEach(function(block) {
            $blockSelect.append(`<option value="${block.name}">${block.name}</option>`);
        });
    }

    function populateDepartments() {
        const $departmentSelect = $('#selectedDepartment');
        const $teachingLoadDepartmentSelect = $('#teachingLoadDepartment');
        
        $departmentSelect.empty();
        $departmentSelect.append('<option value="">Оберіть підрозділ</option>');
        
        $teachingLoadDepartmentSelect.empty();
        $teachingLoadDepartmentSelect.append('<option value="">Оберіть підрозділ</option>');
        
        departments.forEach(function(department) {
            $departmentSelect.append(`<option value="${department.name}">${department.name}</option>`);
            $teachingLoadDepartmentSelect.append(`<option value="${department.name}">${department.name}</option>`);
        });
    }

    function populateGroupDepartments() {
        const $groupDepartmentSelect = $('#groupsSelectedDepartment');
        $groupDepartmentSelect.empty();
        $groupDepartmentSelect.append('<option value="">Оберіть підрозділ</option>');
        
        groupDepartments.forEach(function(department) {
            $groupDepartmentSelect.append(`<option value="${department.name}">${department.name}</option>`);
        });
    }

    function populatePeriodOptions() {
        // Populate for rooms
        const $periodSelect = $('#selectedPeriod');
        $periodSelect.empty();
        
        periodOptions.forEach(function(period) {
            $periodSelect.append(`
                <option value="${period.value}" 
                        data-from="${period.fromDate}" 
                        data-to="${period.toDate}">
                    ${period.label}
                </option>
            `);
        });
        
        // Populate for teachers
        const $teachersPeriodSelect = $('#teachersSelectedPeriod');
        $teachersPeriodSelect.empty();
        
        periodOptions.forEach(function(period) {
            $teachersPeriodSelect.append(`
                <option value="${period.value}" 
                        data-from="${period.fromDate}" 
                        data-to="${period.toDate}">
                    ${period.label}
                </option>
            `);
        });

        // Populate for groups
        const $groupsPeriodSelect = $('#groupsSelectedPeriod');
        $groupsPeriodSelect.empty();
        
        periodOptions.forEach(function(period) {
            $groupsPeriodSelect.append(`
                <option value="${period.value}" 
                        data-from="${period.fromDate}" 
                        data-to="${period.toDate}">
                    ${period.label}
                </option>
            `);
        });

        // Populate for teaching load
        const $teachingLoadPeriodSelect = $('#teachingLoadPeriod');
        $teachingLoadPeriodSelect.empty();
        
        periodOptions.forEach(function(period) {
            $teachingLoadPeriodSelect.append(`
                <option value="${period.value}" 
                        data-from="${period.fromDate}" 
                        data-to="${period.toDate}">
                    ${period.label}
                </option>
            `);
        });
        
        // Set default selection for all
        $periodSelect.val('to_end_of_week');
        $teachersPeriodSelect.val('to_end_of_week');
        $groupsPeriodSelect.val('to_end_of_week');
        $teachingLoadPeriodSelect.val('to_end_of_week');
        updateDateFields();
        toggleDateInputs();
    }

    function setupEventHandlers() {
        // Block selection change
        $('#selectedBlock').on('change', function() {
            const selectedBlockName = $(this).val();
            if (selectedBlockName) {
                populateRooms(selectedBlockName);
            } else {
                resetRooms();
            }
        });

        // Department selection change
        $('#selectedDepartment').on('change', function() {
            const selectedDepartmentName = $(this).val();
            if (selectedDepartmentName) {
                populateTeachers(selectedDepartmentName);
            } else {
                resetTeachers();
            }
        });

        // Group Department selection change
        $('#groupsSelectedDepartment').on('change', function() {
            const selectedDepartmentName = $(this).val();
            if (selectedDepartmentName) {
                populateGroups(selectedDepartmentName);
            } else {
                resetGroups();
            }
        });

        // Period selection change for rooms
        $('#selectedPeriod').on('change', function() {
            updateDateFields();
            toggleDateInputs();
        });

        // Period selection change for teachers
        $('#teachersSelectedPeriod').on('change', function() {
            updateTeachersDateFields();
            toggleTeachersDateInputs();
        });

        // Period selection change for groups
        $('#groupsSelectedPeriod').on('change', function() {
            updateGroupsDateFields();
            toggleGroupsDateInputs();
        });

        // Period selection change for teaching load
        $('#teachingLoadPeriod').on('change', function() {
            updateTeachingLoadDateFields();
            toggleTeachingLoadDateInputs();
        });

        // Form submissions
        $('#roomsScheduleForm').on('submit', function(e) {
            e.preventDefault();
            searchRoomsSchedule();
        });

        $('#teachersScheduleForm').on('submit', function(e) {
            e.preventDefault();
            searchTeachersSchedule();
        });

        $('#groupsScheduleForm').on('submit', function(e) {
            e.preventDefault();
            searchGroupsSchedule();
        });

        $('#teachingLoadForm').on('submit', function(e) {
            e.preventDefault();
            searchTeachingLoad();
        });

        // View toggles for all tabs
        $('input[name="teachersViewToggle"]').on('change', function() {
            const isWeeklyView = $('#teachersWeeklyToggle').is(':checked');
            toggleWeeklyViewClass(isWeeklyView);
            if (isWeeklyView && $('#teachersScheduleCard').is(':visible')) {
                // Re-fetch data with weekly view
                searchTeachersSchedule();
            }
        });

        $('input[name="roomsViewToggle"]').on('change', function() {
            const isWeeklyView = $('#roomsWeeklyToggle').is(':checked');
            toggleWeeklyViewClass(isWeeklyView);
            if (isWeeklyView && $('#roomsScheduleCard').is(':visible')) {
                // Re-fetch data with weekly view
                searchRoomsSchedule();
            }
        });

        $('input[name="groupsViewToggle"]').on('change', function() {
            const isWeeklyView = $('#groupsWeeklyToggle').is(':checked');
            toggleWeeklyViewClass(isWeeklyView);
            if (isWeeklyView && $('#groupsScheduleCard').is(':visible')) {
                // Re-fetch data with weekly view
                searchGroupsSchedule();
            }
        });
    }

    function populateRooms(blockName) {
        const selectedBlock = blocks.find(b => b.name === blockName);
        const $roomSelect = $('#selectedRoom');
        
        $roomSelect.empty();
        $roomSelect.append('<option value="">Оберіть аудиторію</option>');
        
        if (selectedBlock && selectedBlock.objects) {
            selectedBlock.objects.forEach(function(room) {
                $roomSelect.append(`<option value="${room.ID}">${room.name}</option>`);
            });
        }
        
        $roomSelect.prop('disabled', false);
    }

    function populateTeachers(departmentName) {
        const selectedDepartment = departments.find(d => d.name === departmentName);
        const $teacherSelect = $('#selectedTeacher');
        
        $teacherSelect.empty();
        $teacherSelect.append('<option value="">Оберіть викладача</option>');
        
        if (selectedDepartment && selectedDepartment.objects) {
            selectedDepartment.objects.forEach(function(teacher) {
                const teacherName = `${teacher.P} ${teacher.I} ${teacher.B}`;
                $teacherSelect.append(`<option value="${teacher.ID}">${teacherName}</option>`);
            });
        }
        
        $teacherSelect.prop('disabled', false);
    }

    function populateGroups(departmentName) {
        const selectedDepartment = groupDepartments.find(d => d.name === departmentName);
        const $groupSelect = $('#selectedGroup');
        
        $groupSelect.empty();
        $groupSelect.append('<option value="">Оберіть групу</option>');
        
        if (selectedDepartment && selectedDepartment.objects) {
            selectedDepartment.objects.forEach(function(group) {
                $groupSelect.append(`<option value="${group.ID}">${group.name}</option>`);
            });
        }
        
        $groupSelect.prop('disabled', false);
    }

    function resetGroups() {
        const $groupSelect = $('#selectedGroup');
        $groupSelect.empty();
        $groupSelect.append('<option value="">Спочатку оберіть підрозділ</option>');
        $groupSelect.prop('disabled', true);
    }

    function updateDateFields() {
        const selectedPeriod = $('#selectedPeriod option:selected');
        const fromDate = selectedPeriod.data('from');
        const toDate = selectedPeriod.data('to');
        
        if (fromDate && toDate) {
            // Set dd.MM.yyyy format directly for Flatpickr
            $('#fromDate').val(fromDate);
            $('#toDate').val(toDate);
            
            // Update Flatpickr instances
            if (window.fromDatePicker) {
                window.fromDatePicker.setDate(fromDate, false, 'd.m.Y');
            }
            if (window.toDatePicker) {
                window.toDatePicker.setDate(toDate, false, 'd.m.Y');
            }
        }
    }

    function updateTeachersDateFields() {
        const selectedPeriod = $('#teachersSelectedPeriod option:selected');
        const fromDate = selectedPeriod.data('from');
        const toDate = selectedPeriod.data('to');
        
        if (fromDate && toDate) {
            // Set dd.MM.yyyy format directly for Flatpickr
            $('#teachersFromDate').val(fromDate);
            $('#teachersToDate').val(toDate);
            
            // Update Flatpickr instances
            if (window.teachersFromDatePicker) {
                window.teachersFromDatePicker.setDate(fromDate, false, 'd.m.Y');
            }
            if (window.teachersToDatePicker) {
                window.teachersToDatePicker.setDate(toDate, false, 'd.m.Y');
            }
        }
    }

    function updateGroupsDateFields() {
        const selectedPeriod = $('#groupsSelectedPeriod option:selected');
        const fromDate = selectedPeriod.data('from');
        const toDate = selectedPeriod.data('to');
        
        if (fromDate && toDate) {
            // Set dd.MM.yyyy format directly for Flatpickr
            $('#groupsFromDate').val(fromDate);
            $('#groupsToDate').val(toDate);
            
            // Update Flatpickr instances
            if (window.groupsFromDatePicker) {
                window.groupsFromDatePicker.setDate(fromDate, false, 'd.m.Y');
            }
            if (window.groupsToDatePicker) {
                window.groupsToDatePicker.setDate(toDate, false, 'd.m.Y');
            }
        }
    }

    function toggleDateInputs() {
        const selectedPeriod = $('#selectedPeriod').val();
        const isCustomPeriod = selectedPeriod === 'custom';
        
        // Enable/disable date inputs based on period selection
        $('#fromDate').prop('disabled', !isCustomPeriod);
        $('#toDate').prop('disabled', !isCustomPeriod);
        
        // Update Flatpickr instances
        if (window.fromDatePicker) {
            if (isCustomPeriod) {
                window.fromDatePicker.enable();
            } else {
                window.fromDatePicker.disable();
            }
        }
        
        if (window.toDatePicker) {
            if (isCustomPeriod) {
                window.toDatePicker.enable();
            } else {
                window.toDatePicker.disable();
            }
        }
    }

    function toggleTeachersDateInputs() {
        const selectedPeriod = $('#teachersSelectedPeriod').val();
        const isCustomPeriod = selectedPeriod === 'custom';
        
        // Enable/disable date inputs based on period selection
        $('#teachersFromDate').prop('disabled', !isCustomPeriod);
        $('#teachersToDate').prop('disabled', !isCustomPeriod);
        
        // Update Flatpickr instances
        if (window.teachersFromDatePicker) {
            if (isCustomPeriod) {
                window.teachersFromDatePicker.enable();
            } else {
                window.teachersFromDatePicker.disable();
            }
        }
        
        if (window.teachersToDatePicker) {
            if (isCustomPeriod) {
                window.teachersToDatePicker.enable();
            } else {
                window.teachersToDatePicker.disable();
            }
        }
    }

    function toggleGroupsDateInputs() {
        const selectedPeriod = $('#groupsSelectedPeriod').val();
        const isCustomPeriod = selectedPeriod === 'custom';
        
        // Enable/disable date inputs based on period selection
        $('#groupsFromDate').prop('disabled', !isCustomPeriod);
        $('#groupsToDate').prop('disabled', !isCustomPeriod);
        
        // Update Flatpickr instances
        if (window.groupsFromDatePicker) {
            if (isCustomPeriod) {
                window.groupsFromDatePicker.enable();
            } else {
                window.groupsFromDatePicker.disable();
            }
        }
        
        if (window.groupsToDatePicker) {
            if (isCustomPeriod) {
                window.groupsToDatePicker.enable();
            } else {
                window.groupsToDatePicker.disable();
            }
        }
    }

    function updateTeachingLoadDateFields() {
        const selectedPeriod = $('#teachingLoadPeriod option:selected');
        const fromDate = selectedPeriod.data('from');
        const toDate = selectedPeriod.data('to');
        
        if (fromDate && toDate) {
            // Set dd.MM.yyyy format directly for Flatpickr
            $('#teachingLoadFromDate').val(fromDate);
            $('#teachingLoadToDate').val(toDate);
            
            // Update Flatpickr instances
            if (window.teachingLoadFromDatePicker) {
                window.teachingLoadFromDatePicker.setDate(fromDate, false, 'd.m.Y');
            }
            if (window.teachingLoadToDatePicker) {
                window.teachingLoadToDatePicker.setDate(toDate, false, 'd.m.Y');
            }
        }
    }

    function toggleTeachingLoadDateInputs() {
        const selectedPeriod = $('#teachingLoadPeriod').val();
        const isCustomPeriod = selectedPeriod === 'custom';
        
        // Enable/disable date inputs based on period selection
        $('#teachingLoadFromDate').prop('disabled', !isCustomPeriod);
        $('#teachingLoadToDate').prop('disabled', !isCustomPeriod);
        
        // Update Flatpickr instances
        if (window.teachingLoadFromDatePicker) {
            if (isCustomPeriod) {
                window.teachingLoadFromDatePicker.enable();
            } else {
                window.teachingLoadFromDatePicker.disable();
            }
        }
        
        if (window.teachingLoadToDatePicker) {
            if (isCustomPeriod) {
                window.teachingLoadToDatePicker.enable();
            } else {
                window.teachingLoadToDatePicker.disable();
            }
        }
    }

    function searchRoomsSchedule() {
        const roomId = $('#selectedRoom').val();
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();
        const isWeeklyView = $('#roomsWeeklyToggle').is(':checked');

        if (!roomId || !fromDate || !toDate) {
            showError('Необхідно заповнити всі поля');
            return;
        }

        showLoading(true, 'rooms');

        // Convert HTML date format (yyyy-MM-dd) to API format (dd.MM.yyyy)
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);

        const queryString = `req_type=rozklad&req_mode=room&OBJ_ID=${roomId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=json&coding_mode=UTF8&bs=ok`;

        $.ajax({
            url: '/api/schedule/proxy',
            method: 'GET',
            data: {
                q: queryString
            },
            success: function(data) {
                console.log('Rooms Schedule API response:', data);
                
                // Check for API errors in response body
                if (data.psrozklad_export && data.psrozklad_export.error) {
                    const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                    const errorCode = data.psrozklad_export.error.errorcode || '';
                    showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                    showLoading(false, 'rooms');
                    return;
                }
                
                if (isWeeklyView) {
                    toggleWeeklyViewClass(true);
                    displayWeeklySchedule(data, roomId, 'room');
                } else {
                    toggleWeeklyViewClass(false);
                    displayRoomsSchedule(data, roomId);
                }
                showLoading(false, 'rooms');
            },
            error: function(xhr, status, error) {
                console.error('Rooms Schedule API error:', {xhr, status, error});
                const errorDetails = getDetailedErrorMessage(xhr);
                showError('Помилка завантаження розкладу: ' + errorDetails);
                showLoading(false, 'rooms');
            }
        });
    }

    function searchTeachersSchedule() {
        const teacherId = $('#selectedTeacher').val();
        const fromDate = $('#teachersFromDate').val();
        const toDate = $('#teachersToDate').val();
        const isWeeklyView = $('#teachersWeeklyToggle').is(':checked');

        if (!teacherId || !fromDate || !toDate) {
            showError('Необхідно заповнити всі поля');
            return;
        }

        showLoading(true, 'teachers');

        // Always use the proxy endpoint
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);

        const queryString = `req_type=rozklad&req_mode=teacher&OBJ_ID=${teacherId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=json&coding_mode=UTF8&bs=ok`;

        $.ajax({
            url: '/api/schedule/proxy',
            method: 'GET',
            data: {
                q: queryString
            },
            success: function(data) {
                console.log('Teachers Schedule API response:', data);
                
                // Check for API errors in response body
                if (data.psrozklad_export && data.psrozklad_export.error) {
                    const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                    const errorCode = data.psrozklad_export.error.errorcode || '';
                    showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                    showLoading(false, 'teachers');
                    return;
                }
                
                if (isWeeklyView) {
                    toggleWeeklyViewClass(true);
                    displayWeeklySchedule(data, teacherId, 'teacher');
                } else {
                    toggleWeeklyViewClass(false);
                    displayTeachersSchedule(data, teacherId);
                }
                showLoading(false, 'teachers');
            },
            error: function(xhr, status, error) {
                console.error('Teachers Schedule API error:', {xhr, status, error});
                const errorDetails = getDetailedErrorMessage(xhr);
                showError('Помилка завантаження розкладу: ' + errorDetails);
                showLoading(false, 'teachers');
            }
        });
    }

    function searchGroupsSchedule() {
        const groupId = $('#selectedGroup').val();
        const fromDate = $('#groupsFromDate').val();
        const toDate = $('#groupsToDate').val();
        const isWeeklyView = $('#groupsWeeklyToggle').is(':checked');

        if (!groupId || !fromDate || !toDate) {
            showError('Необхідно заповнити всі поля');
            return;
        }

        showLoading(true, 'groups');

        // Convert HTML date format (yyyy-MM-dd) to API format (dd.MM.yyyy)
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);

        const queryString = `req_type=rozklad&req_mode=group&OBJ_ID=${groupId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=json&coding_mode=UTF8&bs=ok`;

        $.ajax({
            url: '/api/schedule/proxy',
            method: 'GET',
            data: {
                q: queryString
            },
            success: function(data) {
                console.log('Groups Schedule API response:', data);
                
                // Check for API errors in response body
                if (data.psrozklad_export && data.psrozklad_export.error) {
                    const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                    const errorCode = data.psrozklad_export.error.errorcode || '';
                    showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                    showLoading(false, 'groups');
                    return;
                }
                
                if (isWeeklyView) {
                    toggleWeeklyViewClass(true);
                    displayWeeklySchedule(data, groupId, 'group');
                } else {
                    toggleWeeklyViewClass(false);
                    displayGroupsSchedule(data, groupId);
                }
                showLoading(false, 'groups');
            },
            error: function(xhr, status, error) {
                console.error('Groups Schedule API error:', {xhr, status, error});
                const errorDetails = getDetailedErrorMessage(xhr);
                showError('Помилка завантаження розкладу: ' + errorDetails);
                showLoading(false, 'groups');
            }
        });
    }

    function searchTeachingLoad() {
        const departmentName = $('#teachingLoadDepartment').val();
        const fromDate = $('#teachingLoadFromDate').val();
        const toDate = $('#teachingLoadToDate').val();

        if (!departmentName || !fromDate || !toDate) {
            showError('Необхідно заповнити всі поля');
            return;
        }

        showLoading(true, 'teachingLoad');

        // Get all teachers from the selected department
        const selectedDepartment = departments.find(d => d.name === departmentName);
        if (!selectedDepartment || !selectedDepartment.objects) {
            showError('Підрозділ не знайдено');
            showLoading(false, 'teachingLoad');
            return;
        }

        const teacherIds = selectedDepartment.objects.map(teacher => teacher.ID);
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);

        // Fetch schedules for all teachers in the department
        const teacherPromises = teacherIds.map(teacherId => {
            const queryString = `req_type=rozklad&req_mode=teacher&OBJ_ID=${teacherId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=json&coding_mode=UTF8&bs=ok`;
            
            return $.ajax({
                url: '/api/schedule/proxy',
                method: 'GET',
                data: { q: queryString }
            });
        });

        Promise.all(teacherPromises)
            .then(function(responses) {
                console.log('Teaching Load API responses:', responses);
                
                // Check for API errors in any response
                for (let i = 0; i < responses.length; i++) {
                    const data = responses[i];
                    if (data.psrozklad_export && data.psrozklad_export.error) {
                        const errorMsg = data.psrozklad_export.error.error_message || 'Невідома помилка API';
                        const errorCode = data.psrozklad_export.error.errorcode || '';
                        showError(`Помилка API (код: ${errorCode}): ${errorMsg}`);
                        showLoading(false, 'teachingLoad');
                        return;
                    }
                }
                
                displayTeachingLoad(responses, selectedDepartment.objects);
                showLoading(false, 'teachingLoad');
            })
            .catch(function(error) {
                console.error('Teaching Load API error:', error);
                const errorDetails = getDetailedErrorMessage(error);
                showError('Помилка завантаження навантаження: ' + errorDetails);
                showLoading(false, 'teachingLoad');
            });
    }

    function formatDateForAPI(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`; // dd.MM.yyyy for API
    }

    function initializeDatePickers() {
        // Initialize Flatpickr for date inputs with dd.MM.yyyy format
        const datePickerConfig = {
            dateFormat: 'd.m.Y',
            locale: 'uk',
            allowInput: true,
            clickOpens: true,
            placeholder: 'дд.мм.рррр',
            disableMobile: false
        };

        // Rooms date pickers
        window.fromDatePicker = flatpickr('#fromDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#fromDate').val(dateStr);
            }
        });

        window.toDatePicker = flatpickr('#toDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#toDate').val(dateStr);
            }
        });

        // Teachers date pickers
        window.teachersFromDatePicker = flatpickr('#teachersFromDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#teachersFromDate').val(dateStr);
            }
        });

        window.teachersToDatePicker = flatpickr('#teachersToDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#teachersToDate').val(dateStr);
            }
        });

        // Groups date pickers
        window.groupsFromDatePicker = flatpickr('#groupsFromDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#groupsFromDate').val(dateStr);
            }
        });

        window.groupsToDatePicker = flatpickr('#groupsToDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#groupsToDate').val(dateStr);
            }
        });

        // Teaching Load date pickers
        window.teachingLoadFromDatePicker = flatpickr('#teachingLoadFromDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#teachingLoadFromDate').val(dateStr);
            }
        });

        window.teachingLoadToDatePicker = flatpickr('#teachingLoadToDate', {
            ...datePickerConfig,
            onChange: function(selectedDates, dateStr) {
                // Ensure the input shows the correct format
                $('#teachingLoadToDate').val(dateStr);
            }
        });
    }

    function convertDateForAPI(htmlDate) {
        // No conversion needed - Flatpickr already provides dd.MM.yyyy format
        return htmlDate;
    }

    function displayRoomsSchedule(data, roomId) {
        const $scheduleCard = $('#roomsScheduleCard');
        const $scheduleContent = $('#roomsScheduleContent');
        const $exportSection = $('#roomsExportSection');
        const $exportLink = $('#roomsExportLink');

        // Get export URL
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);
        const exportQueryString = `req_type=rozklad&req_mode=room&OBJ_ID=${roomId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=iCal&coding_mode=UTF8&bs=ok`;
        const exportUrl = `/api/schedule/proxy?q=${encodeURIComponent(exportQueryString)}`;
        
        // Set export link directly to the proxy URL
        $exportLink.attr('href', exportUrl);
        $exportSection.removeClass('d-none');

        // Display schedule
        if (data.psrozklad_export && data.psrozklad_export.roz_items && data.psrozklad_export.roz_items.length > 0) {
            const groupedSchedule = groupScheduleByDate(data.psrozklad_export.roz_items);
            const roomName = getRoomName(roomId);
            
            let scheduleHtml = `<h5 class="mb-3">Розклад для: ${roomName}</h5>`;
            scheduleHtml += '<div class="row">';
            
            const sortedDates = Object.keys(groupedSchedule).sort(function(a, b) {
                // Convert dd.MM.yyyy format to Date objects for proper sorting
                const datePartsA = a.split('.');
                const datePartsB = b.split('.');
                const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
                const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
                return dateA - dateB;
            });
            sortedDates.forEach(function(date, index) {
                const daySchedule = groupedSchedule[date];
                const colClass = index % 2 === 0 ? 'col-md-6' : 'col-md-6';
                scheduleHtml += `
                    <div class="${colClass} mb-3">
                        ${createDayScheduleHtml(date, daySchedule)}
                    </div>
                `;
            });
            
            scheduleHtml += '</div>';
            $scheduleContent.html(scheduleHtml);
        } else {
            $scheduleContent.html(`
                <div class="text-center text-muted py-5">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-3">На обраний період розклад не знайдено</p>
                </div>
            `);
        }

        $scheduleCard.removeClass('d-none');
    }

    function displayTeachersSchedule(data, teacherId) {
        const $scheduleCard = $('#teachersScheduleCard');
        const $scheduleContent = $('#teachersScheduleContent');
        const $exportSection = $('#teachersExportSection');
        const $exportLink = $('#teachersExportLink');

        // Get export URL
        const fromDate = $('#teachersFromDate').val();
        const toDate = $('#teachersToDate').val();
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);
        const exportQueryString = `req_type=rozklad&req_mode=teacher&OBJ_ID=${teacherId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=iCal&coding_mode=UTF8&bs=ok`;
        const exportUrl = `/api/schedule/proxy?q=${encodeURIComponent(exportQueryString)}`;
        
        // Set export link directly to the proxy URL
        $exportLink.attr('href', exportUrl);
        $exportSection.removeClass('d-none');

        // Display schedule
        if (data.psrozklad_export && data.psrozklad_export.roz_items && data.psrozklad_export.roz_items.length > 0) {
            const groupedSchedule = groupScheduleByDate(data.psrozklad_export.roz_items);
            const teacherName = getTeacherName(teacherId);
            
            let scheduleHtml = `<h5 class="mb-3">Розклад для: ${teacherName}</h5>`;
            scheduleHtml += '<div class="row">';
            
            const sortedDates = Object.keys(groupedSchedule).sort(function(a, b) {
                // Convert dd.MM.yyyy format to Date objects for proper sorting
                const datePartsA = a.split('.');
                const datePartsB = b.split('.');
                const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
                const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
                return dateA - dateB;
            });
            sortedDates.forEach(function(date, index) {
                const daySchedule = groupedSchedule[date];
                const colClass = index % 2 === 0 ? 'col-md-6' : 'col-md-6';
                scheduleHtml += `
                    <div class="${colClass} mb-3">
                        ${createDayScheduleHtml(date, daySchedule)}
                    </div>
                `;
            });
            
            scheduleHtml += '</div>';
            $scheduleContent.html(scheduleHtml);
        } else {
            $scheduleContent.html(`
                <div class="text-center text-muted py-5">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-3">На обраний період розклад не знайдено</p>
                </div>
            `);
        }

        $scheduleCard.removeClass('d-none');
    }

    function displayGroupsSchedule(data, groupId) {
        const $scheduleCard = $('#groupsScheduleCard');
        const $scheduleContent = $('#groupsScheduleContent');
        const $exportSection = $('#groupsExportSection');
        const $exportLink = $('#groupsExportLink');

        // Get export URL
        const fromDate = $('#groupsFromDate').val();
        const toDate = $('#groupsToDate').val();
        const fromDateAPI = convertDateForAPI(fromDate);
        const toDateAPI = convertDateForAPI(toDate);
        const exportQueryString = `req_type=rozklad&req_mode=group&OBJ_ID=${groupId}&OBJ_name=&dep_name=&ros_text=united&begin_date=${fromDateAPI}&end_date=${toDateAPI}&req_format=iCal&coding_mode=UTF8&bs=ok`;
        const exportUrl = `/api/schedule/proxy?q=${encodeURIComponent(exportQueryString)}`;
        
        // Set export link directly to the proxy URL
        $exportLink.attr('href', exportUrl);
        $exportSection.removeClass('d-none');

        // Display schedule
        if (data.psrozklad_export && data.psrozklad_export.roz_items && data.psrozklad_export.roz_items.length > 0) {
            const groupedSchedule = groupScheduleByDate(data.psrozklad_export.roz_items);
            const groupName = getGroupName(groupId);
            
            let scheduleHtml = `<h5 class="mb-3">Розклад для: ${groupName}</h5>`;
            scheduleHtml += '<div class="row">';
            
            const sortedDates = Object.keys(groupedSchedule).sort(function(a, b) {
                // Convert dd.MM.yyyy format to Date objects for proper sorting
                const datePartsA = a.split('.');
                const datePartsB = b.split('.');
                const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
                const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
                return dateA - dateB;
            });
            sortedDates.forEach(function(date, index) {
                const daySchedule = groupedSchedule[date];
                const colClass = index % 2 === 0 ? 'col-md-6' : 'col-md-6';
                scheduleHtml += `
                    <div class="${colClass} mb-3">
                        ${createDayScheduleHtml(date, daySchedule)}
                    </div>
                `;
            });
            
            scheduleHtml += '</div>';
            $scheduleContent.html(scheduleHtml);
        } else {
            $scheduleContent.html(`
                <div class="text-center text-muted py-5">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-3">На обраний період розклад не знайдено</p>
                </div>
            `);
        }

        $scheduleCard.removeClass('d-none');
    }

    function displayTeachingLoad(responses, teachers) {
        const $scheduleCard = $('#teachingLoadCard');
        const $scheduleContent = $('#teachingLoadContent');

        // Analyze session types and create workload matrix
        const workloadMatrix = createWorkloadMatrix(responses, teachers);
        
        let scheduleHtml = '<div class="table-responsive">';
        scheduleHtml += '<table class="table table-bordered table-sm">';
        scheduleHtml += '<thead class="table-dark">';
        scheduleHtml += '<tr><th>Викладач</th>';
        
        // Add session type headers
        const sessionTypes = Object.keys(workloadMatrix.sessionTypes);
        sessionTypes.forEach(function(sessionType) {
            scheduleHtml += `<th class="text-center">${sessionType}</th>`;
        });
        scheduleHtml += '<th class="text-center table-primary">Всього</th>';
        scheduleHtml += '</tr></thead><tbody>';
        
        // Add teacher rows
        teachers.forEach(function(teacher) {
            const teacherName = `${teacher.P} ${teacher.I} ${teacher.B}`;
            scheduleHtml += '<tr>';
            scheduleHtml += `<td class="fw-bold">${teacherName}</td>`;
            
            let totalHours = 0;
            sessionTypes.forEach(function(sessionType) {
                const hours = workloadMatrix.teacherWorkload[teacher.ID]?.[sessionType] || 0;
                totalHours += hours;
                scheduleHtml += `<td class="text-center">${hours}</td>`;
            });
            
            scheduleHtml += `<td class="text-center fw-bold table-primary">${totalHours}</td>`;
            scheduleHtml += '</tr>';
        });
        
        scheduleHtml += '</tbody></table></div>';
        
        $scheduleContent.html(scheduleHtml);
        $scheduleCard.removeClass('d-none');
    }

    function createWorkloadMatrix(responses, teachers) {
        const sessionTypes = {};
        const teacherWorkload = {};
        
        // Initialize teacher workload
        teachers.forEach(function(teacher) {
            teacherWorkload[teacher.ID] = {};
        });
        
        // Process each teacher's schedule
        responses.forEach(function(response, index) {
            const teacherId = teachers[index].ID;
            
            if (response.psrozklad_export && response.psrozklad_export.roz_items) {
                response.psrozklad_export.roz_items.forEach(function(item) {
                    // Extract session type from lesson description
                    const sessionType = extractSessionType(item.lesson_description);
                    if (sessionType) {
                        // Count this session type
                        if (!sessionTypes[sessionType]) {
                            sessionTypes[sessionType] = true;
                        }
                        
                        if (!teacherWorkload[teacherId][sessionType]) {
                            teacherWorkload[teacherId][sessionType] = 0;
                        }
                        
                        // Each session counts as 2 hours
                        teacherWorkload[teacherId][sessionType] += 2;
                    }
                });
            }
        });
        
        return {
            sessionTypes: sessionTypes,
            teacherWorkload: teacherWorkload
        };
    }

    function extractSessionType(lessonDescription) {
        if (!lessonDescription) return null;
        
        // Look for session type patterns in the lesson description
        const patterns = [
            /\(Лаб\)/i,    // Laboratory
            /\(Л\)/i,      // Lecture
            /\(Пр\)/i,     // Practice
            /\(Сем\)/i,    // Seminar
            /\(КЗ\)/i,     // Control work
            /\(Зал\)/i,    // Credit
            /\(Екз\)/i,    // Exam
            /\(Курс\)/i,   // Course work
            /\(Диплом\)/i, // Diploma
            /\(Конс\)/i    // Consultation
        ];
        
        for (let pattern of patterns) {
            const match = lessonDescription.match(pattern);
            if (match) {
                return match[0];
            }
        }
        
        return null;
    }

    function groupScheduleByDate(scheduleItems) {
        const grouped = {};
        scheduleItems.forEach(function(item) {
            if (!grouped[item.date]) {
                grouped[item.date] = [];
            }
            grouped[item.date].push(item);
        });
        return grouped;
    }

    function getRoomName(roomId) {
        for (const block of blocks) {
            if (block.objects) {
                const room = block.objects.find(r => r.ID === roomId);
                if (room) {
                    return room.name;
                }
            }
        }
        return 'Невідома аудиторія';
    }

    function getTeacherName(teacherId) {
        for (const department of departments) {
            if (department.objects) {
                const teacher = department.objects.find(t => t.ID === teacherId);
                if (teacher) {
                    return `${teacher.P} ${teacher.I} ${teacher.B}`;
                }
            }
        }
        return 'Невідомий викладач';
    }

    function getGroupName(groupId) {
        for (const department of groupDepartments) {
            if (department.objects) {
                const group = department.objects.find(g => g.ID === groupId);
                if (group) {
                    return group.name;
                }
            }
        }
        return 'Невідома група';
    }

    function createDayScheduleHtml(date, daySchedule) {
        // Convert date from dd.MM.yyyy format to Date object
        const dateParts = date.split('.');
        const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        const dayName = getDayName(dateObj.getDay());
        const formattedDate = dateObj.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        let dayHtml = `
            <div class="card h-100">
                <div class="card-header">
                    <strong>${dayName}, ${formattedDate}</strong>
                </div>
                <div class="card-body">
        `;

        if (daySchedule && daySchedule.length > 0) {
            dayHtml += `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th style="width: 10%">№</th>
                                <th style="width: 15%">Час</th>
                                <th style="width: 75%">Заняття</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            daySchedule.forEach(function(item) {
                dayHtml += `
                    <tr>
                        <td class="text-center fw-bold">${item.lesson_number || ''}</td>
                        <td class="text-primary fw-bold">${item.lesson_time || ''}</td>
                        <td>${item.lesson_description || ''}</td>
                    </tr>
                `;
            });
            
            dayHtml += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            dayHtml += '<div class="text-muted">Розклад відсутній</div>';
        }

        dayHtml += '</div></div>';
        return dayHtml;
    }

    function getDayName(dayIndex) {
        const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
        return days[dayIndex];
    }

    function getWeekStart(date) {
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(date.getFullYear(), date.getMonth(), diff);
    }

    function getWeekEnd(date) {
        const weekStart = getWeekStart(new Date(date));
        return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    }

    function getCurrentTerm(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if ((month === 8 && day >= 20) || month === 9 || month === 10 || month === 11 || month === 12 || (month === 1 && day <= 15)) {
            return {
                start: new Date(date.getFullYear(), 8, 1), // September 1
                end: new Date(date.getFullYear(), 11, 31)  // December 31
            };
        } else {
            return {
                start: new Date(date.getFullYear(), 1, 20), // February 20
                end: new Date(date.getFullYear(), 5, 30)    // June 30
            };
        }
    }

    function showLoading(show, type = 'rooms') {
        let $spinner, $buttonText, $button;
        
        if (type === 'rooms') {
            $spinner = $('#searchRoomsBtn .spinner-border');
            $button = $('#searchRoomsBtn');
        } else if (type === 'teachers') {
            $spinner = $('#searchTeachersBtn .spinner-border');
            $button = $('#searchTeachersBtn');
        } else if (type === 'groups') {
            $spinner = $('#searchGroupsBtn .spinner-border');
            $button = $('#searchGroupsBtn');
        } else if (type === 'teachingLoad') {
            $spinner = $('#searchTeachingLoadBtn .spinner-border');
            $button = $('#searchTeachingLoadBtn');
        }
        
        $buttonText = $button.contents().filter(function() {
            return this.nodeType === 3;
        });

        if (show) {
            $spinner.removeClass('d-none');
            $buttonText.text(' Завантаження...');
            $button.prop('disabled', true);
        } else {
            $spinner.addClass('d-none');
            if (type === 'teachingLoad') {
                $buttonText.text('Розрахувати навантаження');
            } else {
                $buttonText.text('Знайти розклад');
            }
            $button.prop('disabled', false);
        }
    }

    function showError(message) {
        const $errorAlert = $('#errorAlert');
        $errorAlert.text(message).removeClass('d-none');
        
        // Make error more visible
        $errorAlert.css({
            'background-color': '#f8d7da',
            'border-color': '#f5c6cb',
            'color': '#721c24',
            'padding': '15px',
            'border-radius': '8px',
            'margin-bottom': '15px',
            'font-weight': '600'
        });
        
        // Auto-hide after 10 seconds (longer for debugging)
        setTimeout(function() {
            $errorAlert.addClass('d-none');
        }, 10000);
        
        // Also log to console for debugging
        console.error('Application Error:', message);
    }

    function getErrorMessage(xhr) {
        if (xhr.responseJSON && xhr.responseJSON.error) {
            return xhr.responseJSON.error;
        }
        return xhr.statusText || 'Невідома помилка';
    }

    function getDetailedErrorMessage(xhr) {
        let errorMessage = 'Невідома помилка';
        if (xhr.responseJSON && xhr.responseJSON.error) {
            errorMessage = xhr.responseJSON.error;
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
            errorMessage = xhr.responseJSON.message;
        } else if (xhr.responseText) {
            errorMessage = xhr.responseText;
        } else if (xhr.statusText) {
            errorMessage = xhr.statusText;
        }
        return `${xhr.status} ${xhr.statusText}: ${errorMessage}`;
    }

    function getMonthIdFromDate(dateString) {
        // Convert dd.MM.yyyy to month number (1-12)
        const parts = dateString.split('.');
        if (parts.length === 3) {
            return parseInt(parts[1], 10);
        }
        return new Date().getMonth() + 1; // Default to current month
    }

    function displayWeeklySchedule(data, objectId, scheduleType) {
        let $scheduleCard, $scheduleContent, $exportSection, objectName;
        
        // Determine which elements to use based on schedule type
        if (scheduleType === 'teacher') {
            $scheduleCard = $('#teachersScheduleCard');
            $scheduleContent = $('#teachersScheduleContent');
            $exportSection = $('#teachersExportSection');
            objectName = getTeacherName(objectId);
        } else if (scheduleType === 'room') {
            $scheduleCard = $('#roomsScheduleCard');
            $scheduleContent = $('#roomsScheduleContent');
            $exportSection = $('#roomsExportSection');
            objectName = getRoomName(objectId);
        } else if (scheduleType === 'group') {
            $scheduleCard = $('#groupsScheduleCard');
            $scheduleContent = $('#groupsScheduleContent');
            $exportSection = $('#groupsExportSection');
            objectName = getGroupName(objectId);
        }

        // Hide export section for weekly view (can be added later if needed)
        $exportSection.addClass('d-none');

        // Display weekly schedule
        if (data.psrozklad_export && data.psrozklad_export.roz_items && data.psrozklad_export.roz_items.length > 0) {
            const groupedSchedule = groupScheduleByDate(data.psrozklad_export.roz_items);
            const weeks = createWeeklyView(groupedSchedule);
            
            let scheduleHtml = `<h5 class="mb-3">Розклад для: ${objectName}</h5>`;
            scheduleHtml += '<div class="weekly-view-container"><div class="weekly-view">';
            
            weeks.forEach(function(week) {
                scheduleHtml += `
                    <div class="card mb-4">
                        <div class="card-header">
                            <h6 class="mb-0">Тиждень ${week.weekNumber} (${week.startDate} - ${week.endDate})</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                `;
                
                week.days.forEach(function(day) {
                    scheduleHtml += `
                        <div class="col-md-2 mb-3">
                            <div class="card h-100 day-card">
                                <div class="card-header text-center day-header">
                                    <strong>${day.dayName}</strong><br>
                                    <small>${day.date}</small>
                                </div>
                                <div class="card-body p-2">
                    `;
                    
                    if (day.lessons && day.lessons.length > 0) {
                        day.lessons.forEach(function(lesson) {
                            scheduleHtml += `
                                <div class="lesson-item">
                                    <div class="lesson-time">${lesson.time}</div>
                                    <div class="lesson-description">${lesson.description}</div>
                                </div>
                            `;
                        });
                    } else {
                        scheduleHtml += '<div class="text-muted text-center small">Немає занять</div>';
                    }
                    
                    scheduleHtml += `
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                scheduleHtml += `
                            </div>
                        </div>
                    </div>
                `;
            });
            
            scheduleHtml += '</div></div>'; // Close weekly-view and weekly-view-container divs
            $scheduleContent.html(scheduleHtml);
        } else {
            $scheduleContent.html(`
                <div class="text-center text-muted py-5">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-3">На обраний період розклад не знайдено</p>
                </div>
            `);
        }

        $scheduleCard.removeClass('d-none');
    }

    function createWeeklyView(groupedSchedule) {
        const weeks = [];
        const sortedDates = Object.keys(groupedSchedule).sort(function(a, b) {
            // Convert dd.MM.yyyy format to Date objects for proper sorting
            const datePartsA = a.split('.');
            const datePartsB = b.split('.');
            const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
            const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
            return dateA - dateB;
        });

        if (sortedDates.length === 0) {
            return weeks;
        }

        // Get the first date to determine the first Monday
        const firstDateParts = sortedDates[0].split('.');
        const firstDate = new Date(firstDateParts[2], firstDateParts[1] - 1, firstDateParts[0]);
        const firstMonday = getWeekStart(firstDate);
        
        // Get the last date to determine the last Friday
        const lastDateParts = sortedDates[sortedDates.length - 1].split('.');
        const lastDate = new Date(lastDateParts[2], lastDateParts[1] - 1, lastDateParts[0]);
        const lastFriday = getWeekEnd(getWeekStart(lastDate));

        let currentWeekStart = new Date(firstMonday);
        let weekNumber = 1;

        while (currentWeekStart <= lastFriday) {
            const weekEnd = new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000); // Friday
            
            const week = {
                weekNumber: weekNumber++,
                startDate: formatDateForDisplay(currentWeekStart),
                endDate: formatDateForDisplay(weekEnd),
                days: []
            };

            // Add days for this week (Monday to Friday)
            for (let i = 0; i < 5; i++) {
                const dayDate = new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
                const dayString = formatDateForDisplay(dayDate);
                
                const day = {
                    date: dayString,
                    dayName: getDayName(dayDate.getDay()),
                    lessons: []
                };

                // Find lessons for this day
                const dayLessons = groupedSchedule[dayString] || [];
                day.lessons = dayLessons.map(function(lesson) {
                    return {
                        time: lesson.lesson_time || '',
                        description: lesson.lesson_description || ''
                    };
                }).sort(function(a, b) {
                    return a.time.localeCompare(b.time);
                });

                week.days.push(day);
            }

            weeks.push(week);
            currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
        }

        return weeks;
    }

    function getWeekStart(date) {
        const dayOfWeek = date.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1
        return new Date(date.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
    }

    function getWeekEnd(weekStart) {
        return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    }

    function formatDateForDisplay(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function toggleWeeklyViewClass(isWeeklyView) {
        const $container = $('.container');
        if (isWeeklyView) {
            $container.addClass('weekly-view-active');
        } else {
            $container.removeClass('weekly-view-active');
        }
    }
}); 