package com.dilekkaraca.is_takip_sistemi_backend.stage.enums;

public enum StageStatus {
    PENDING,
    WAITING_APPROVAL,
    APPROVED
}
/*
PENDING

Aşama henüz tamamlanmadı.

Yani:

hiç kimse bitirmedi
veya
bazıları bitirdi ama herkes bitirmedi
WAITING_APPROVAL

Tüm atanan kişiler işini bitirdi, artık yönetici onayı bekleniyor.

APPROVED

Yönetici onayladı, aşama kapandı.
 */