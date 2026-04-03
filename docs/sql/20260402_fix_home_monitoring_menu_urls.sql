UPDATE COMTNMENUINFO
SET MENU_URL = '/monitoring/dashboard',
    MENU_NM = '통합 대시보드',
    MENU_NM_EN = 'Unified Dashboard',
    MENU_ICON = 'dashboard'
WHERE MENU_CODE = 'H0050101';

UPDATE COMTNMENUINFO
SET MENU_URL = '/monitoring/realtime',
    MENU_NM = '실시간 모니터링',
    MENU_NM_EN = 'Real-time Monitoring',
    MENU_ICON = 'monitoring'
WHERE MENU_CODE = 'H0050102';

SELECT MENU_CODE, MENU_URL, MENU_NM, MENU_NM_EN, MENU_ICON
FROM COMTNMENUINFO
WHERE MENU_CODE IN ('H0050101', 'H0050102')
ORDER BY MENU_CODE;
