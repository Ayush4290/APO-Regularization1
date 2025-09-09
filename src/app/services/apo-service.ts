import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ApoService {
  constructor(private http: HttpClient) {
  }

  async getEmpAsync(roleId: any = ''): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/empbyrole?roleId=${roleId}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch post details: ${this.handleError(error)}`);
    }
  }

  async getPostAsync(): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/post`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch post details: ${this.handleError(error)}`);
    }
  }

  async getStatusAsync(): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/status`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch status details: ${this.handleError(error)}`);
    }
  }

  async getHeadAsync(): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/hq`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch hq details: ${this.handleError(error)}`);
    }
  }

  async getDeptAsync(): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/dept`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch department details: ${this.handleError(error)}`);
    }
  }

  async getReasonAsync(): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/reason`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch reason details: ${this.handleError(error)}`);
    }
  }

  async getPersonnelByIdAsync(id: any): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/master/emp/${id}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch personnel details: ${this.handleError(error)}`);
    }
  }

  async getDashboardAsync(body: any): Promise<any> {
    try {
      return await this.http.post(`${environment.apoUrl}/api/dashboard/getall`, body).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch dashboard: ${this.handleError(error)}`);
    }
  }

  async createApoDocAsync(body: any): Promise<any> {
    try {
      return await this.http.post<any>(`${environment.apoUrl}/api/apo-docs`, body).toPromise();
    } catch (error) {
      throw new Error(`Failed to create apo docs: ${this.handleError(error)}`);
    }
  }

  async getApoDocAsync(body: any): Promise<any> {
    try {
      return await this.http.get(`${environment.apoUrl}/api/apo-docs?fileIds=${body.fileIds}&createdBy=${body.createdBy}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch apo doc: ${this.handleError(error)}`);
    }
  }

  async getApoDocByOrderAsync(body: any): Promise<any> {
    try {
      return await this.http.get(`${environment.apoUrl}/api/apo-docs/byorder?orderNo=${body.orderNo}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch apo doc: ${this.handleError(error)}`);
    }
  }

  async deleteApoDocAsync(body: any): Promise<any> {
    try {
      //return await this.http.delete(`${environment.apoUrl}/api/apo-docs`, body).toPromise();
      return await this.http.request('DELETE', `${environment.apoUrl}/api/apo-docs`, {
        body: body,
      }).toPromise();
    } catch (error) {
      throw new Error(`Failed to delete apo docs: ${this.handleError(error)}`);
    }
  }

  async createApoAsync(body: any): Promise<any> {
    try {
      return await this.http.post<any>(`${environment.apoUrl}/api/apo-orders`, body).toPromise();
    } catch (error) {
      throw new Error(`Failed to create: ${this.handleError(error)}`);
    }
  }

  async updateApoAsync(body: any): Promise<any> {
    try {
      return await this.http.put<any>(`${environment.apoUrl}/api/apo-orders`, body).toPromise();
    } catch (error) {
      throw new Error(`Failed to update with ID ${body.id}: ${this.handleError(error)}`);
    }
  }

  async deteleApoOrderAsync(orderNo: any): Promise<any> {
    try {
      return await this.http.delete<any>(`${environment.apoUrl}/api/apo-orders?orderNo=${orderNo}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to delete apo orders with ID ${orderNo}: ${this.handleError(error)}`);
    }
  }

  async genApoAsync(): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/apo-orders/apoid`).toPromise();
    } catch (error) {
      throw new Error(`Failed to gen apo no: ${this.handleError(error)}`);
    }
  }

  async getApoByOrderNoAsync(body: any): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/apo-orders?orderNo=${body.orderNo}&createdBy=${body.createdBy}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch apo orders: ${this.handleError(error)}`);
    }
  }

  async getAuditHistoryAsync(body: any): Promise<any> {
    try {
      return await this.http.get<any>(`${environment.apoUrl}/api/audit?orderNo=${body.orderNo}&roleId=${body.roleId}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch audit history: ${this.handleError(error)}`);
    }
  }

  async createConsultAsync(body: any): Promise<any> {
    try {
      return await this.http.post<any>(`${environment.apoUrl}/api/consult`, body, { responseType: 'text' as 'json' }).toPromise();
    } catch (error) {
      throw new Error(`Failed to post consult: ${this.handleError(error)}`);
    }
  }

  async getConsultByAsync(body: any): Promise<any> {
    try {
      return await this.http.get(`${environment.apoUrl}/api/consult?orderNo=${body.orderNo}&createdBy=${body.createdBy}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch all consult: ${this.handleError(error)}`);
    }
  }

  async getAllConsultAsync(body: any): Promise<any> {
    try {
      return await this.http.get(`${environment.apoUrl}/api/consult/getall?userId=${body.createdBy}&deptId=${body.deptId}`).toPromise();
    } catch (error) {
      throw new Error(`Failed to fetch all consult: ${this.handleError(error)}`);
    }
  }

  async openFileInNewTab(base64String: any, fileType: any) {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes.buffer], { type: fileType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }

  async downloadFiles(base64String: any, fileType: any, fileName: any) {
    const linkSource = `data:${fileType};base64,${base64String}`;
    const downloadLink = document.createElement("a");

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  groupBy(list: any[], key: string): Map<string, any[]> {
    const map = new Map<string, any[]>();
    list.forEach(item => {
      const itemKey = item[key];
      const collection = map.get(itemKey);
      if (!collection) {
        map.set(itemKey, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  private handleError(error: any): string {
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        return `Client-side error: ${error.error.message}`;
      } else {
        return `Server-side error: ${error.status} - ${error.message || error.statusText}`;
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred.';
  }
}