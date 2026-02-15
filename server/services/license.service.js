import os from 'os';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import activationService from './activation.service.js';

/**
 * Enterprise Licensing & Revenue Protection Service (Phase C)
 * Responsible for commercial protection, machine binding, and online activation.
 */
class LicenseService {
    constructor() {
        this.dataPath = process.env.DATA_PATH || process.cwd();
        this.licensePath = path.join(this.dataPath, 'license.dat');
        this.trialStatePath = path.join(this.dataPath, 'trial.json');
    }

    /**
     * Generate a cryptographic fingerprint of the host hardware.
     */
    async getMachineFingerprint() {
        try {
            let cpuId = '';
            let diskId = '';

            if (process.platform === 'win32') {
                cpuId = execSync('wmic cpu get processorid').toString().split('\n')[1].trim();
                diskId = execSync('wmic diskdrive get serialnumber').toString().split('\n')[1].trim();
            } else {
                cpuId = os.hostname();
                diskId = os.arch();
            }

            const rawString = `${cpuId}|${diskId}|${os.arch()}|${os.totalmem()}`;
            return crypto.createHash('sha256').update(rawString).digest('hex');
        } catch (e) {
            return crypto.createHash('sha256').update(os.hostname()).digest('hex');
        }
    }

    /**
     * Online Activation Procedure
     * Contacts Cloud Activation Server to issue a machine-bound license
     */
    async activateOnline(serialKey) {
        const fingerprint = await this.getMachineFingerprint();
        const result = await activationService.activateOnline(serialKey, fingerprint);

        if (result.success) {
            // Persist the issued license locally
            fs.writeFileSync(this.licensePath, JSON.stringify(result.licensePayload, null, 2));
            return { success: true, message: 'Product Activated Successfully!', tier: result.licensePayload.tier };
        }
        return result;
    }

    getTrialStatus() {
        try {
            if (fs.existsSync(this.trialStatePath)) {
                const data = JSON.parse(fs.readFileSync(this.trialStatePath, 'utf8'));
                const startDate = new Date(data.startDate);
                const now = new Date();
                const diffDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));

                return {
                    isTrial: true,
                    daysRemaining: Math.max(0, 14 - diffDays),
                    isExpired: diffDays > 14,
                    startedOn: data.startDate
                };
            } else {
                const trialData = { startDate: new Date().toISOString() };
                fs.writeFileSync(this.trialStatePath, JSON.stringify(trialData, null, 2));
                return { isTrial: true, daysRemaining: 14, isExpired: false, startedOn: trialData.startDate };
            }
        } catch (e) {
            return { isTrial: true, daysRemaining: 0, isExpired: true };
        }
    }

    async verifyLicense() {
        if (!fs.existsSync(this.licensePath)) {
            return { success: false, mode: 'TRIAL', ...this.getTrialStatus() };
        }

        try {
            const licenseData = JSON.parse(fs.readFileSync(this.licensePath, 'utf8'));
            const machineHash = await this.getMachineFingerprint();

            if (licenseData.machineHash !== machineHash) {
                return { success: false, error: 'HARDWARE_MISMATCH', mode: 'INVALID' };
            }

            if (new Date() > new Date(licenseData.expiry)) {
                return { success: false, error: 'LICENSE_EXPIRED', mode: 'EXPIRED' };
            }

            return {
                success: true,
                mode: 'LICENSED',
                type: licenseData.type || 'STANDARD',
                tier: licenseData.tier || 'Standard Edition',
                expiry: licenseData.expiry,
                customer: licenseData.customer
            };
        } catch (e) {
            return { success: false, error: 'TAMPER_DETECTED', mode: 'INVALID' };
        }
    }

    /**
     * Get Tier-Based Product Entitlements
     * Controls feature availability based on commercial status
     */
    async getProductLimits() {
        const license = await this.verifyLicense();

        if (license.success) {
            const isPro = license.type === 'PRO' || license.type === 'ENTERPRISE';
            return {
                maxEmployees: license.type === 'ENTERPRISE' ? Infinity : (license.type === 'PRO' ? 500 : 100),
                allowExports: true,
                hasWatermark: false,
                isLicensed: true,
                tier: license.tier,
                features: {
                    advancedReports: isPro,
                    cloudSync: isPro,
                    multiUser: license.type === 'ENTERPRISE'
                }
            };
        }

        return {
            maxEmployees: 50,
            allowExports: false,
            hasWatermark: true,
            isLicensed: false,
            isExpired: license.isExpired,
            daysRemaining: license.daysRemaining,
            tier: 'Free Trial',
            features: {
                advancedReports: false,
                cloudSync: false,
                multiUser: false
            }
        };
    }
}

export default new LicenseService();
