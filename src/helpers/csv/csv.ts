import Parser from "csv-parse/lib/sync";
import Stringify from "csv-stringify/lib/sync";

import uniq from "lodash/uniq";

import { readFileSync, writeFileSync } from "fs";

export interface Contact {
  name: string;
  emails: string[];
  phones: string[];
}

class Csv {
  private csvDatas = [];
  private contacts: Contact[];
  private phoneFields: string[];
  private emailFields: string[];

  /**
   * Read file and parse it
   * Find email fields and phone fields
   * @param filePath
   */
  public read(filePath: string): Contact[] {
    const datas: string = readFileSync(filePath, { encoding: "utf-8" });
    this.csvDatas = Parser(datas, {
      skip_empty_lines: true,
      columns: true
    });

    this.findFields();

    this.contacts = this.mapData();
    return this.contacts;
  }

  private findFields(): void {
    this.findEmailField();
    this.findPhoneField();
  }

  /**
   * Find email fields
   */
  private findEmailField(): void {
    if (this.csvDatas.length < 0) {
      this.emailFields = [];
      return;
    }

    this.emailFields = Object.keys(this.csvDatas[0]).filter(key => {
      return /E-mail\s\d - Value/.test(key);
    });
  }

  /**
   * Find phone fields
   */
  private findPhoneField(): void {
    if (this.csvDatas.length < 0) {
      this.phoneFields = [];
      return;
    }

    this.phoneFields = Object.keys(this.csvDatas[0]).filter(key => {
      return /Phone\s\d - Value/.test(key);
    });
  }

  /**
   * Map the cvs data to contact
   */
  public mapData(): Contact[] {
    return this.csvDatas.map(csvData => {
      return {
        name: csvData.Name,
        emails: this.handleEmail(csvData),
        phones: this.handlePhone(csvData)
      };
    });
  }

  /**
   * Manage email, and filter it
   */
  private handleEmail(csvData: string[]): string[] {
    return uniq(this.handle(csvData, this.emailFields));
  }

  private handle(csvData, fieldsName: string[]) {
    const arrTmp = [];

    fieldsName.forEach(fieldName => {

      // The field exist  
      if (csvData[fieldName]) {
        
        // Check if field have multi value separate by :::
        if (csvData[fieldName].includes(":::")) {
          const tmp = csvData[fieldName].split(":::");
          tmp.forEach(element => {
            arrTmp.push(element.replace(/\s+/g, "")) // remove white space);
          });
        } else {
          arrTmp.push(csvData[fieldName]);
        }
      }
    });

    return arrTmp;
  }

  /**
   * Manage phone, and filter it
   */
  private handlePhone(csvData): string[] {
    const phones = this.handle(csvData, this.phoneFields);

    const phonesGood = phones.map(phone => {
      let phoneGood = phone
        .replace(/\s+/g, "") // remove white space
        .replace(/-/g, "") // remove -
        .replace(/\./g, ""); // remove .

      phoneGood = this.addPlus(phoneGood);

      return phoneGood;
    });

    return uniq(phonesGood);
  }

  /**
   * Add goog regional to phone
   * @param phone
   */
  private addPlus(phone: string): string {
    if (phone.startsWith("33")) return "+" + phone;
    if (phone.startsWith("00")) return "+" + phone.slice(2);

    if (phone.startsWith("01")) return "+33" + phone.slice(1);
    if (phone.startsWith("02")) return "+33" + phone.slice(1);
    if (phone.startsWith("03")) return "+33" + phone.slice(1);
    if (phone.startsWith("04")) return "+33" + phone.slice(1);
    if (phone.startsWith("05")) return "+33" + phone.slice(1);
    if (phone.startsWith("06")) return "+33" + phone.slice(1);
    if (phone.startsWith("07")) return "+33" + phone.slice(1);
    if (phone.startsWith("09")) return "+33" + phone.slice(1);

    if (phone.startsWith("6")) return "+33" + phone;
    return phone;
  }

  public export() {
    const contactsTmp = this.contacts.map(contact => {
        return {
            name: contact.name,
            emails: contact.emails.join(' , '),
            phones: contact.phones.join(' , ')
        }
    })

    const toWrite = Stringify(contactsTmp);
    writeFileSync("./test.csv", toWrite);
  }
}

export const csv = new Csv();
