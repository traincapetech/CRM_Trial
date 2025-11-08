import api from './api';

class LoggingService {
  static async createLog(action, details, affectedResource, resourceId = null, status = 'SUCCESS') {
    try {
      const response = await api.post('/logs', {
        action,
        details,
        affectedResource,
        resourceId,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  static async logLogin(userId, success) {
    return this.createLog(
      'LOGIN',
      {
        userId,
        success
      },
      'USER',
      userId,
      success ? 'SUCCESS' : 'FAILURE'
    );
  }

  static async logLogout(userId) {
    return this.createLog(
      'LOGOUT',
      {
        userId
      },
      'USER',
      userId
    );
  }

  static async logSaleCreate(saleData) {
    return this.createLog(
      'SALE_CREATE',
      {
        customerName: saleData.customerName,
        amount: saleData.amount,
        product: saleData.product,
        salesPerson: saleData.salesPerson
      },
      'SALE',
      saleData._id
    );
  }

  static async logSaleUpdate(saleId, changes) {
    return this.createLog(
      'SALE_UPDATE',
      {
        saleId,
        changes
      },
      'SALE',
      saleId
    );
  }

  // New methods for lead logging
  static async logLeadCreate(leadData) {
    return this.createLog(
      'LEAD_CREATE',
      {
        name: leadData.name || leadData.NAME,
        email: leadData.email || leadData['E-MAIL'],
        course: leadData.course || leadData.COURSE,
        assignedTo: leadData.assignedTo || leadData['SALE PERSON'],
        leadPerson: leadData.leadPerson || leadData['LEAD PERSON']
      },
      'LEAD',
      leadData._id
    );
  }

  static async logLeadUpdate(leadId, changes) {
    return this.createLog(
      'LEAD_UPDATE',
      {
        leadId,
        changes
      },
      'LEAD',
      leadId
    );
  }

  static async logLeadDelete(leadId, leadData) {
    return this.createLog(
      'LEAD_DELETE',
      {
        leadId,
        leadData
      },
      'LEAD',
      leadId
    );
  }

  static async logLeadAssign(leadId, assignedTo, previousAssignee) {
    return this.createLog(
      'LEAD_ASSIGN',
      {
        leadId,
        assignedTo,
        previousAssignee
      },
      'LEAD',
      leadId
    );
  }

  static async logEmployeeCreate(employeeData) {
    return this.createLog(
      'EMPLOYEE_CREATE',
      {
        employeeName: employeeData.fullName,
        role: employeeData.role,
        department: employeeData.department
      },
      'EMPLOYEE',
      employeeData._id
    );
  }

  static async logEmployeeUpdate(employeeId, changes) {
    return this.createLog(
      'EMPLOYEE_UPDATE',
      {
        employeeId,
        changes
      },
      'EMPLOYEE',
      employeeId
    );
  }

  static async logAttendanceMark(employeeId, type, time) {
    return this.createLog(
      'ATTENDANCE_MARK',
      {
        employeeId,
        type, // 'IN' or 'OUT'
        time
      },
      'ATTENDANCE',
      employeeId
    );
  }

  static async logLeaveRequest(employeeId, leaveData) {
    return this.createLog(
      'LEAVE_REQUEST',
      {
        employeeId,
        leaveType: leaveData.type,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason
      },
      'LEAVE',
      leaveData._id
    );
  }

  static async logLeaveUpdate(leaveId, status, updatedBy) {
    return this.createLog(
      'LEAVE_UPDATE',
      {
        leaveId,
        status,
        updatedBy
      },
      'LEAVE',
      leaveId
    );
  }

  static async logPayrollUpdate(employeeId, payrollData) {
    return this.createLog(
      'PAYROLL_UPDATE',
      {
        employeeId,
        month: payrollData.month,
        year: payrollData.year,
        amount: payrollData.amount
      },
      'PAYROLL',
      employeeId
    );
  }

  static async logSettingsUpdate(settingType, changes) {
    return this.createLog(
      'SETTINGS_UPDATE',
      {
        settingType,
        changes
      },
      'SETTINGS'
    );
  }
}

export default LoggingService; 